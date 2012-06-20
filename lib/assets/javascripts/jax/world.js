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
      this.renderOctree = false;
      this.context  = context;
      this.lights = [];
      this.objects = {};
      this.ambientColor = new Jax.Color(0.05, 0.05, 0.05, 1);
      this._renderQueue = [];
      
      // These numbers pulled from a hat.
      this.octree = new Jax.Octree(20, 10);
      this._octreeModel = new Jax.Model({octree: this.octree});

      var world = this;
      this.invalidateShadowMaps = function() {
        var obj = this; // when event is fired, `this` becomes the object
        for (var i = 0; i < world.lights.length; i++) {
          if (obj.castShadow && world.lights[i].isInRange(obj))
            world.lights[i].shadowmap.invalidate();
        }
      };
      
      this.updateOctree = function() {
        var obj = this;
        world.octree.update(obj);
      };
      
      // called by the octree during traversal
      this.octreeTraversal = function(node) {
        var size = node.size * 2;
        var camera = world.context.player.camera;
        var i, keepRecursing, objects, objectCount;
        switch(camera.getFrustum().cube(node.position, size, size, size)) {
          case Jax.Scene.Frustum.OUTSIDE:
            // not visible, abort traversal
            return false;
          case Jax.Scene.Frustum.INSIDE:
            // completely visible, render all objects and abort traversal
            keepRecursing = false;
            objectCount = node.nestedObjectCount;
            objects = node.nestedObjects;
          default:
            // partially visible, render immediate objects and traverse
            keepRecursing = true;
            objectCount = node.objectCount;
            objects = node.objects;
        }

        if (world.renderOctree && objectCount)
          node.mesh.render(world.context, world._octreeModel, world._activeMaterial);
        for (i in objects) {
          o = objects[i];
          // transparencies need to be queued so they can be rendered last
          if (o.transparent || (o.mesh && o.mesh.transparent))
            world._renderQueue.push(o);
          else
            o.render(world.context, world._activeMaterial);
        }
        
        return keepRecursing;
      };
      
      // called to reorder transparencies
      // FIXME this is probably the slowest sorting algorithm in history.
      var buf = vec3.create();
      this._queueSorter = function(a, b) {
        var camPos = world.context.player.camera.getPosition();
        var len1 = vec3.length(vec3.subtract(a.position, camPos));
        var len2 = vec3.length(vec3.subtract(b.position, camPos));
        if (a.mesh) len1 -= a.mesh.bounds.radius;
        if (b.mesh) len2 -= b.mesh.bounds.radius;
        return len1 - len2;
      };
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
     * Jax.World#addObject(object[, options]) -> Jax.Model
     * - object (Jax.Model): the instance of Jax.Model to add to this world.
     *
     * options:
     * * addToOctree: defaults to true
     *
     * Adds the model to the world and then returns the model itself unchanged.
     *
     **/
    addObject: function(object, options) {
      if (!options || options.addToOctree !== false) {
        this.octree.add(object);
        object.addEventListener('transformed', this.updateOctree);
      } else {
        this.objects[object.__unique_id] = object;
      }

      if (object.castShadow) {
        // immediately invalidate shadow maps in range so that this object
        // doesn't go unnoticed
        this.invalidateShadowMaps.apply(object);
        object.addEventListener('transformed', this.invalidateShadowMaps);
      }

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
      var obj;
      if (typeof(object_or_id) != 'number') {
        obj = object_or_id;
      } else {
        obj = this.objects[object_or_id];
        if (!obj) return;
      }
      delete this.objects[obj.__unique_id];
      
      // invalidate shadow maps if necessary so that this object's shadow
      // is removed
      this.invalidateShadowMaps.apply(obj);
      obj.removeEventListener('transformed', this.invalidateShadowMaps);
      obj.removeEventListener('transformed', this.updateOctree);
      var node;
      if (node = this.octree.find(obj)) node.remove(obj);
      
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
      if (ary) ary.splice(0, ary.length);
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
      
      this.parsePickData(data, ary);
      return ary;
    },
    
    /*
    Receives RGBA image data, which should have been encoded during a render-to-texture
    using the 'picking' material. Iterates through the image data and populates `array`
    with exactly one of each decoded ID encountered. Returns the number of IDs
    encountered.
    */
    parsePickData: function(rgba, array) {
      var index;
      for (var i = 2; i < rgba.length; i += 4) {
        if (rgba[i] > 0) { // blue key exists, we've found an object
          index = Jax.Util.decodePickingColor(rgba[i-2], rgba[i-1], rgba[i], rgba[i+1]);
          if (index !== undefined && array.indexOf(index) === -1)
            array.push(index);
        }
      }
      
      return array.length;
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
      var i, context = this.context;
      
      if (material && !(material instanceof Jax.Material))
        material = Jax.Material.find(material);
        
      // render objects in the octree.
      // octree traverses in front to back order
      // objects with `transparent=true` will be queued
      // and then rendered last, from back to front.
      var queue = this._renderQueue;
      previousActiveMaterial = this._activeMaterial;
      this._activeMaterial = material;
      this.octree.traverse(this.context.player.camera.getPosition(), this.octreeTraversal);
      this._activeMaterial = previousActiveMaterial;
      
      // render transparencies
      /* FIXME The octree does yield nodes in order, but can't yet guarantee the
         order of the objects in the node. No big deal for opaques but we have to
         sort the transparencies because of this. */
      if (queue.length) {
        queue = queue.sort(this._queueSorter);
        while (queue.length)
          queue.pop().render(context, material);
      }

      // render objects not in the octree
      for (i in this.objects)
        this.objects[i].render(context, material);
        
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
      var i;
      for (i in this.objects)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
      return this;
    },
    
    /**
     * Jax.World#dispose([include_objects=true]) -> Jax.World
     *
     * Disposes of this world by removing all references to its objects and
     * disposing its light sources. Note that by default, objects within this 
     * world will also be disposed. Pass `false` as an argument if you do not want
     * the objects to be disposed.
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
        if (include_objects !== false) {
          this.objects[i].dispose(this.context);
          delete this.objects[i];
        }
      for (i = 0; i < this.lights.length; i++)
        this.lights[i].dispose(this.context);
      this.lights.splice(0, this.lights.length);
    }
  });
})();

Object.defineProperty(Jax.World.prototype, 'ambientColor', {
  get: function() { return this._ambientColor; },
  set: function(c) { this._ambientColor = Jax.Color.parse(c); }
});
