//= require "jax/webgl/scene"

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
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lights = [];
      this.objects = {};
    },
    
    /**
     * Jax.World#getPickBuffer() -> Jax.Framebuffer
     * 
     * Returns the framebuffer used for picking. See also #pickRegionalIndices.
     **/
    getPickBuffer: function() {
      if (this.pickBuffer) return this.pickBuffer;
      return this.pickBuffer = new Jax.Framebuffer({
        depth: true,
        width: this.context.canvas.width,
        height: this.context.canvas.height
      });
    },
    
    /**
     * Jax.World#addLight(light) -> Jax.Light
     * - light (Jax.Light | Object): the name of, or options describing, or
     *                               instance of Jax.Light to add to this world.
     *
     * Adds the light to the world and then returns the light itself unchanged.
     **/
    addLight: function(light) {
      if (!(light instanceof Jax.Light))
        light = Jax.Light.find(light);
      this.lights.push(light);
      return light;
    },
    
    /**
     * Jax.World#addObject(object) -> Jax.Model
     * - object (Jax.Model): the instance of Jax.Model to add to this world.
     *
     * Adds the model to the world and then returns the model itself unchanged.
     *
     **/
    addObject: function(object) {
      this.objects[object.__unique_id] = object;
      return object;
    },
    
    /**
     * Jax.World#getObject(unique_id) -> Jax.Model
     * - unique_id (Number): the unique ID associated with this model instance
     *
     * Returns the object with the specified unique ID if it has been
     * added to this World, or undefined if it has not.
     **/
    getObject: function(unique_id) { return this.objects[unique_id]; },
    
    /**
     * Jax.World#removeObject(object_or_unique_id) -> Jax.Model
     * - object_or_unique_id (Number|Jax.Model): the model instance to remove,
     *                                           or its unique ID
     *
     * If the model or its ID has not been added to this World, nothing happens
     * and the return value is undefined. Otherwise, the object is removed from
     * this World and then returned.
     **/
    removeObject: function(object_or_id) {
      if (typeof(object_or_id) != 'number')
        object_or_id = object_or_id.__unique_id;

      var obj = this.objects[object_or_id];
      delete this.objects[object_or_id];
      return obj;
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
     * Picks all visible object IDs within the specified rectangular regions and returns them as elements in
     * an array.
     *
     * An object's ID matches is unique throughout Jax, even across multiple contexts.
     *
     * If you want references to the actual objects, instead of just their unique IDs, consider using
     * the #pickRegion() method instead.
     *
     **/
    pickRegionalIndices: function(x1, y1, x2, y2, ary) {
      var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
      if (ary) ary = ary.splice(0, ary.length);
      else ary = new Array();
      var world = this, pickBuffer = this.getPickBuffer(), context = this.context;
      var data = new Uint8Array(w*h*4);
      x1 = Math.min(x1, x2);
      y1 = Math.min(y1, y2);

      pickBuffer.bind(context, function() {
        pickBuffer.viewport(context);
        context.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.gl.disable(GL_BLEND);
        world.render("picking");
        // read it back in
        context.gl.readPixels(x1, y1, w, h, GL_RGBA, GL_UNSIGNED_BYTE, data);
        if (data.data) data = data.data;
      });
      
      // restore the visible viewport and blending
      context.gl.viewport(0, 0, context.canvas.width, context.canvas.height);
      context.gl.enable(GL_BLEND);
      
      var index;
      for (var i = 2; i < data.length; i += 4) {
        if (data[i] > 0) { // blue key exists, we've found an object
          index = Jax.Util.decodePickingColor(data[i-2], data[i-1], data[i], data[i+1]);
          if (index != undefined && ary.indexOf(index) == -1) {
            ary.push(index);
          }
        }
      }
      
      return ary;
    },
    
    /**
     * Jax.World#pickRegion(x1, y1, x2, y2[, ary]) -> Array
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
      var result = this.pickRegionalIndices(x1, y1, x2, y2, ary);
      for (var i = 0; i < result.length; i++)
        result[i] = Jax.Model.__instances[result[i]];
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
      var result = this.pickRegionalIndices(x, y, x+1, y+1, this._pick_ary)[0];
      return result;
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
      if (index != undefined) {
        return Jax.Model.__instances[index];
      }
      return index;
    },
    
    /**
     * Jax.World#countObjects() -> Number
     * Returns the number of objects currently registered with this World.
     **/
    countObjects: function() {
      var count = 0;
      for (var i in this.objects) count++;
      return count;
    },
    
    /**
     * Jax.World#getShadowCasters() -> Array
     *
     * Returns an array of all known shadow-casters in this World.
     **/
    getShadowCasters: function() { return this.lighting.getShadowCasters(); },
    
    /**
     * Jax.World#render([material]) -> Jax.World
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
    render: function(material) {
      var i;
      
      if (material && !(material instanceof Jax.Material))
        material = Jax.Material.find(material);

      for (i in this.objects)
        this.objects[i].render(this.context, material);
      
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
      for (var i in this.objects)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
      return this;
    },
    
    /**
     * Jax.World#dispose([include_objects=true]) -> Jax.World
     *
     * Disposes of this world by removing all references to its objects and
     * reinitializing its +Jax.Scene.LightManager+ instance. Note that by
     * default, objects within this world will also be disposed. Pass
     * `false` as an argument if you do not want the objects to be disposed.
     *
     * Note that both models and meshes _can_ be reused after disposal; they'll just
     * be silently re-initialized. This means it is safe to dispose of models while
     * they are still being used (although this is slow and not recommended if at all
     * avoidable).
     *
     **/
    dispose: function(include_objects) {
      var i, o;
      for (i in this.objects)
        if (include_objects !== false)
          delete this.objects[i];
      this.lights.splice(0, this.lights.length);
    }
  });
})();
