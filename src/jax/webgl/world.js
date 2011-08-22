//= require "scene"

/**
 * class Jax.World
 * 
 * A +Jax.World+ represents a scene in the graphics engine. All objects to be rendered (or at least,
 * all objects that you do not want to manually control!) should be added to the world. Each instance
 * of +Jax.Context+ has its own +Jax.World+, and the currently-active +Jax.World+ is delegated into
 * controllers and views as the +this.world+ property.
 *
 **/
Jax.World = (function() {
  function getPickBuffer(self) {
    if (self.pickBuffer) return self.pickBuffer;
    return self.pickBuffer = new Jax.Framebuffer({
      width:self.context.canvas.width,
      height:self.context.canvas.height
    });
  }
  
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager(context);
      this.objects  = [];
    },
    
    /**
     * Jax.World#addLightSource(light) -> Jax.Scene.LightSource
     * - light (Jax.Scene.LightSource): the instance of Jax.Scene.LightSource to add to this world.
     *
     * Adds the light to the world and then returns the light itself unchanged.
     **/
    addLightSource: function(light)   { this.lighting.add(light); },
    
    /**
     * Jax.World#addObject(object) -> Jax.Model
     * - object (Jax.Model): the instance of Jax.Model to add to this world.
     *
     * Adds the model to the world and then returns the model itself unchanged.
     *
     **/
    addObject: function(object) {
      this.objects.push(object);
      if (object.isLit() || object.isShadowCaster())
        this.lighting.addObject(object);
      return object;
    },
    
    /**
     * Jax.World#getObject(index) -> Jax.Model
     * - index (Number): the world index of this object
     *
     * Returns the object with the specified world index, or undefined.
     **/
    getObject: function(index) { return this.objects[index]; },
    
    /**
     * Jax.World#removeObject(object_or_index) -> Jax.Model
     * - object_or_index (Number|Jax.Model): the model instance to remove, or its world index
     *
     * If the model or its index cannot be found, nothing happens and the return value is undefined.
     * Otherwise, the object is removed from this World and then returned.
     **/
    removeObject: function(object_or_index) {
      if (this.objects[object_or_index]) {
        var obj = this.objects[object_or_index];
        this.objects.splice(object_or_index, 1);
        this.lighting.removeObject(obj);
        return obj;
      }
      else
        for (var i = 0; i < this.objects.length; i++)
          if (this.objects[i] == object_or_index)
          {
            this.objects.splice(i, 1);
            this.lighting.removeObject(this.objects[i]);
            return this.objects[i];
          }
    },
    
    /**
     * Jax.World#pickRegionalIndices(x1, y1, x2, y2[, ary]) -> Array
     * - x1 (Number): the screen X coordinate of the first corner of the 2D rectangle within which to pick
     * - y1 (Number): the screen Y coordinate of the first corner of the 2D rectangle within which to pick
     * - x2 (Number): the screen X coordinate of the second corner of the 2D rectangle within which to pick
     * - y2 (Number): the screen Y coordinate of the second corner of the 2D rectangle within which to pick
     * - ary (Array): an optional array to populate. A new one will be created if this is not specified.
     *                (Note: the array's contents will be cleared.)
     * 
     * Picks all visible object indices within the specified rectangular regions and returns them as elements in
     * an array.
     *
     * An object's index matches its position in the world's object list. That is, the following code is
     * valid:
     *
     *     this.world.getObjects(this.world.pickRegionalIDs(0,0, 100,100));
     *
     **/
    pickRegionalIndices: function(x1, y1, x2, y2, ary) {
      var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
      if (ary) ary.clear();
      else ary = new Array();
      var world = this, pickBuffer = getPickBuffer(this), context = this.context;
      var data = new Uint8Array(w*h*4);

      pickBuffer.bind(context, function() {
        pickBuffer.viewport(context);
         context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
         context.glDisable(GL_BLEND);
         world.render({material:"picking"});
         // read it back in
         context.glReadPixels(x1, y1, w, h, GL_RGBA, GL_UNSIGNED_BYTE, data);
         if (data.data) data = data.data;
      });
      
      // restore the visible viewport and blending
      context.glViewport(0, 0, context.canvas.width, context.canvas.height);
      context.glEnable(GL_BLEND);
      
      var index;
      for (var i = 2; i < data.length; i += 4) {
        if (data[i] > 0) { // blue key exists, we've found an object
          index = Jax.Util.decodePickingColor(data[i-2], data[i-1], data[i], data[i+1]);
          if (index != undefined) {
            ary.push(index);
          }
        }
      }
      
      return ary;
    },
    
    /**
     * Jax.World#pickRegion(x1, y1, x2, y2) -> Array
     * - x1 (Number): the screen X coordinate of the first corner of the 2D rectangle within which to pick
     * - y1 (Number): the screen Y coordinate of the first corner of the 2D rectangle within which to pick
     * - x2 (Number): the screen X coordinate of the second corner of the 2D rectangle within which to pick
     * - y2 (Number): the screen Y coordinate of the second corner of the 2D rectangle within which to pick
     * - ary (Array): an optional array to populate. A new one will be created if this is not specified.
     *                (Note: the array's contents will be cleared.)
     *
     * Picks all visible objects within the specified rectangular regions and returns them as elements in
     * an array.
     **/
    pickRegion: function(x1, y1, x2, y2, ary) {
      var result = this.pickRegionalIndices(x1, y1, x2, y2);
      for (var i = 0; i < result.length; i++)
        result[i] = this.getObject(i);
      return result;
    },
    
    /**
     * Jax.World#pickIndex(x, y) -> Number | undefined
     * - x (Number): the screen X coordinate to pick at
     * - y (Number): the screen Y coordinate to pick at
     *
     * Picks the visible object at the specified position and returns its index as used by
     * +Jax.World#getObject+. If no object is visible at the given position, the special value
     * +undefined+ is returned.
     **/
    pickIndex: function(x, y) {
      this._pick_ary = this._pick_ary || new Array();
      return this.pickRegionalIndices(x, y, x+1, y+1, this._pick_ary)[0];
    },
    
    /**
     * Jax.World#pick(x, y) -> Jax.Model | undefined
     * - x (Number): the screen X coordinate to pick at
     * - y (Number): the screen Y coordinate to pick at
     *
     * Picks the visible object at the specified position and returns it. If no object is visible
     * at the given position, the special value +undefined+ is returned.
     **/
    pick: function(x, y) {
      var index = this.pickIndex(x, y);
      if (index != undefined)
        return this.getObject(index);
      return index;
    },
    
    /**
     * Jax.World#countObjects() -> Number
     * Returns the number of objects currently registered with this World.
     **/
    countObjects: function() {
      return this.objects.length;
    },
    
    /**
     * Jax.World#getShadowCasters() -> Array
     *
     * Returns an array of all known shadow-casters in this World.
     **/
    getShadowCasters: function() { return this.lighting.getShadowCasters(); },
    
    /**
     * Jax.World#render([options]) -> Jax.World
     *
     * Renders this World to its Jax context. Options, if specified, are delegated
     * to the individual models to be rendered.
     *
     * Prior to rendering, this function assigns the blend function to
     * (+GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA+).
     *
     * This function determines whether light sources are to have an effect on the
     * render pass. If so, the world's +Jax.LightManager+ instance is invoked to
     * render the objects; otherwise, the objects are rendered directly with the
     * +unlit+ option set to +true+.
     **/
    render: function(options) {
      var i;
      
      /* this.current_pass is used by the material */

      this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      var unlit = Jax.Util.normalizeOptions(options, {unlit:true});
      
      if (this.lighting.isEnabled() && (!unlit.material || (unlit.material.supportsLighting && unlit.material.supportsLighting()))) {
        /* illumination pass */
        this.context.current_pass = Jax.Scene.ILLUMINATION_PASS;
        this.lighting.illuminate(this.context, options);

        /* ambient pass - unlit objects only because lit objects get ambient+diffuse+specular in one pass */
        this.context.current_pass = Jax.Scene.AMBIENT_PASS;
        for (i = 0; i < this.objects.length; i++)
          if (!this.objects[i].isLit()) {
            unlit.model_index = i;
            this.objects[i].render(this.context, unlit);
          }
      } else {
        this.context.current_pass = Jax.Scene.AMBIENT_PASS;
        for (i = 0; i < this.objects.length; i++) {
          unlit.model_index = i;
          this.objects[i].render(this.context, unlit);
        }
      }
      
      return this;
    },
    
    /**
     * Jax.World#update(timechange) -> Jax.World
     * - timechange (Number): the number of seconds to have passed since the last
     * call to +Jax.World#update+.
     *
     * Updates each object in the world, passing the +timechange+ argument into
     * the objects' respective +update+ functions (if they have one).
     **/
    update: function(timechange) {
      for (var i = this.objects.length-1; i >= 0; i--)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
      return this;
    },
    
    /**
     * Jax.World#dispose() -> Jax.World
     *
     * Disposes of this world by removing all references to its objects and
     * reinitializing its +Jax.Scene.LightManager+ instance. Note that the
     * individual objects are not disposed; this is left as a task for either
     * the developer or the JavaScript garbage collector. The reason for this
     * is because it is impossible for Jax.World to know whether the objects
     * in question are in use by other Worlds.
     **/
    dispose: function() {
      var i, o;
      
      for (i = this.objects.length-1; i >= 0; i--)
        (o = this.objects.pop());// && o.dispose();
      
      this.lighting = new Jax.Scene.LightManager(this.context);
    }
  });
})();
