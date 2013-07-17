//= require 'jax/core/event_emitter'

/**
 * class Jax.Model
 * 
 * Models encapsulate virtually all business logic. If a Monster knows how to attack, the logic
 * that makes it do so is held within the +Monster+ model. If the terrain has trees and other
 * vegetation, the +Terrain+ model is responsible for setting that up.
 *
 * While controllers generally have only high-level code such as initial scene set-up and
 * processing of user input, models handle nearly everything else.
 *
 * Models also contain the actual game data. Jax further splits models into two components: the
 * Model itself and its Resources.
 *
 * Define a model like so:
 *
 *     var Monster = Jax.Model.create({
 *       after_initialize: function() {
 *         // code to be run automatically after a monster is instantiated
 *       },
 * 
 *       update: function(time) {
 *         // code to be run automatically every few milliseconds
 *       },
 *
 *       dealDamageTo: function(otherModel) {
 *         // custom method, called only when you invoke it
 *         otherModel.takeDamage(this.attack_damage);
 *       }
 *     });
 *
 * Once defined, you can add data easily:
 *
 *     Monster.addResources({"ogre": {
 *       hit_points: 100,
 *       attack_damage: 75
 *     }});
 *
 * You can instantiate a model whose resources already exist like so:
 *
 *     var ogre = Monster.find("ogre");
 *
 * Note that subsequent calls to +Model.find+ will return unique objects. For instance, the
 * following code will add 3 separate "ogres" to the world:
 *
 *     world.addObject(Monster.find("ogre"));
 *     world.addObject(Monster.find("ogre"));
 *     world.addObject(Monster.find("ogre"));
 * 
 **/
(function() {
  function initProperties(self, data) {
    // important, to prevent data.mesh from being replaced with an identical clone!
    if (data && data.mesh) {
      self.mesh = data.mesh;
      delete data.mesh;
    }
    
    // to make sure sub-properties of data are standalone objects, so that the original data can't be tainted
    data = Jax.Util.merge(data, {});
    
    var attribute;
        
    if (data) {
      for (attribute in data) {
        switch(attribute) {
          case 'position':    self.camera.position = Jax.Util.vectorize(data[attribute]); break;
          case 'direction':   self.camera.direction = Jax.Util.vectorize(data[attribute]); break;
          default:
            self[attribute] = data[attribute];
        }
      }
    }
  }
  
  Jax.Model = (function() {
    return Jax.Class.create({
      /**
       * new Jax.Model(data)
       * - data: a set of attributes to be assigned to this instance of the model.
       *
       * Anything can be in the data, or you may supply no data at all to instantiate
       * a model with its default attributes.
       *
       * The following attributes have special meanings:
       *
       * * +position+ : sets the position of this model in world coordinates.
       * * +direction+ : sets the direction this model is facing, in world coordinates.
       * * +mesh+: an instance of +Jax.Mesh+
       * * +shadow_caster+ : true or false; specifies whether this model can cast shadows.
       * * +lit+ : true or false; specifies whether this model is affected by nearby lights.
       *
       **/
      initialize: function(data) {
        var self = this;
        this.__unique_id = Jax.guid();
        this.camera = new Jax.Camera();
        this.camera.addEventListener('updated', function() { self.fireEvent('transformed'); });
        
        initProperties(this, Jax.Model.default_properties);
        if (this._klass && this._klass.resources)
          initProperties(this, this._klass.resources['default']);
        initProperties(this, data);
        
        if (this.after_initialize) this.after_initialize();
      },
      
      /**
       * Jax.Model#isShadowCaster() -> Boolean
       *
       * Returns true if this model casts shadows upon other models in the scene. Note that
       * even if true, shadows will only be cast upon models which utilize +Jax.Material+s that support
       * both the +Lighting+ and +ShadowMap+ effects.
       *
       **/
      isShadowCaster: function() { return this.shadow_caster; },

      /** alias of: Jax.Model#isShadowCaster
       * Jax.Model#isShadowcaster() -> Boolean
       *
       * Returns true if this model casts shadows upon other models in the scene. Note that
       * even if true, shadows will only be cast upon models which utilize +Jax.Material+s that support
       * both the +Lighting+ and +ShadowMap+ effects.
       *
       **/
      isShadowcaster: function() { return this.shadow_caster; },
      
      /**
       * Jax.Model#disableShadows() -> Boolean
       *
       * Disables shadows cast by this model. Returns whether or not shadows were previously enabled
       * prior to this method call.
       **/
      disableShadows: function() { var was = this.shadow_caster; this.shadow_caster = false; return was; },

      /**
       * Jax.Model#render(context) -> undefined
       * 
       * Renders this model with the given context. If the model doesn't have a mesh,
       * nothing is rendered.
       **/
      render: function(context, material) {
        if (this.mesh)
        {
          if (!Jax.Model.__instances[this.__unique_id])
            Jax.Model.__instances[this.__unique_id] = this;
          this.pushMatrices(context);
          this.mesh.render(context, this, material);
          this.popMatrices(context);
        }
      },
      
      pushMatrices: function(context) {
        context.matrix_stack.push();
        context.matrix_stack.multModelMatrix(this.camera.getTransformationMatrix());
      },
      
      popMatrices: function(context) {
        context.matrix_stack.pop();
      },
      
      /**
       * Jax.Model#getBoundingCube() -> Object
       *
       * Returns an object describing the cubic dimensions of this model.
       * 
       * Example:
       *
       *     var bounds = new Jax.Model({mesh:new Jax.Mesh.Cube()}).getBoundingCube();
       *     // 'bounds' contains the following:
       *     {
       *       left: -0.5,
       *       right: 0.5,
       *       bottom: -0.5,
       *       top: 0.5,
       *       front: 0.5,
       *       back: -0.5,
       *       width: 1.0,
       *       height: 1.0,
       *       depth: 1.0
       *     }
       * 
       **/
      getBoundingCube: function() {
        if (!this.mesh) return {left:0,right:0,bottom:0,top:0,front:0,back:0,width:0,height:0,depth:0};
        return this.mesh.bounds;
      },
      
      /**
       * Jax.Model#getBoundingSphereRadius() -> Number
       *
       * A sphere can be defined with two values: a position and a radius. A model's
       * position is always known via its camera (see +Jax.Model#camera+).
       *
       * This method returns the radius of its bounding sphere. A bounding sphere is
       * guaranteed to contain the furthest-away point from the model's position. It is less
       * accurate than +Jax.Model#getBoundingCube+, but using it is much faster.
       *
       **/
      getBoundingSphereRadius: function() {
        var b = this.getBoundingCube();
        return Math.max(b.width, Math.max(b.height, b.depth));
      },
      
      /**
       * Jax.Model#dispose() -> undefined
       *
       * Disposes of this model and its mesh.
       *
       * Note that both models and meshes _can_ be reused after disposal; they'll just
       * be silently re-initialized. This means it is safe to dispose of models while
       * they are still being used (although this is slow and not recommended if at all
       * avoidable).
       **/
      dispose: function() {
        if (this.mesh)
          this.mesh.dispose();
        if (Jax.Model.__instances[this.__unique_id])
          delete Jax.Model.__instances[this.__unique_id];
      },
      
      /**
       * Jax.Model#isLit() -> Boolean
       *
       * Returns true if this model can be lit by other light sources. Note that even
       * if this is true, the +Jax.Material+ used by its +Jax.Mesh+ must support the
       * +Lighting+ effect in order to actually perform the lighting effect.
       *
       **/
      isLit: function() {
        return this.lit;
      },

      /**
       * Jax.Mesh#setColor(r, g, b, a) -> Jax.Model
       * Jax.Mesh#setColor(colors) -> Jax.Model
       *
       * Sets the color to the specified RGBA color, or an array containing
       * RGBA colors. This is method simply delegated into `this.mesh`.
       *
       * Returns itself.
       *
       **/
      setColor: function(a, b, c, d) {
        if (arguments.length > 1) this.mesh.setColor(a, b, c, d);
        else this.mesh.setColor(a);
        return this;
      },

      /**
       * Jax.Model#inspect() -> String
       * 
       * Returns the JSON representation of the attributes in this model.
       * Unlike JSON.stringify(), this method will omit function definitions so
       * that only actual data elements are returned in the resulting JSON string.
       * 
       **/
      inspect: function() {
        result = {};
        for (var i in this)
          if (!Object.isFunction(this[i]) && i != "_klass")
            result[i] = this[i];
        return JSON.stringify(result);
      }
    });
  })();
  
  var model_class_methods = {
    /**
     * Jax.Model.find(id) -> Jax.Model
     * - id (String): the unique identifier of the model to be found
     * 
     * Finds the resource with the specified name, instantiates its model and returns it.
     * 
     * Note that this is a class method of the model in question, and not of Jax.Model itself.
     * 
     * For example, this would be correct:
     * 
     *     Character.find('bad_guy')
     *     
     * while this would be *incorrect*:
     * 
     *     Jax.Model.find('bad_guy')
     *     
     **/
    find: function(id) {
      for (var resource_id in this.resources) {
        if (id == resource_id)
          return new this(this.resources[id]);
      }
      throw new Error("Resource '"+id+"' not found!");
    },

    /**
     * Jax.Model.addResources(resources) -> undefined
     * - resources (Object): the resources to be added
     * 
     * Adds the resources to the specified model. These resources can then be found using
     * Jax.Model.find(id).
     * 
     * Note that this is a class method of the model in question, and not of Jax.Model itself.
     * 
     * For example, this would be correct:
     * 
     *     Character.addResources({'bad_guy': {...}})
     *     
     * while this would be *incorrect*:
     * 
     *     Jax.Model.addResources({'bad_guy': {...}})
     *     
     **/
    addResources: function(resources) {
      this.resources = this.resources || {};
      for (var id in resources)
        if (this.resources[id]) throw new Error("Duplicate resource ID: "+id);
        else this.resources[id] = resources[id];
    },
    
    /**
     * Jax.Model.removeAllResources() -> undefined
     * 
     * Removes all resources from this model. Existing instances won't be
     * affected, but #find() will fail for any resource not re-added using
     * #addResources().
     *
     * Useful for managing test cases, so that they can run in isolation.
     **/
    removeAllResources: function() {
      this.resources = {};
    }
  };
  
  Jax.Model.default_properties = {
    receiveShadow: true,  // can shadows be cast upon this object?
    castShadow: true,     // can this object cast shadows upon others?
    illuminated: true,    // can this object be illuminated by lights?
    cull: true,           // can this object be frustum culled?
  };
  
  Object.defineProperty(Jax.Model.prototype, 'position', {
    get: function() { return this.camera.position; },
    set: function(p) { return this.camera.position = p; }
  });
  
  Object.defineProperty(Jax.Model.prototype, 'direction', {
    get: function() { return this.camera.direction; },
    set: function(p) { return this.camera.direction = p; }
  });
  
  /**
   * Jax.Model.create(inner) -> klass<Jax.Model>
   * - inner (Object): a set of methods the class will contain.
   * Jax.Model.create(superclass, inner) -> klass<Jax.Model>
   * - superclass (Jax.Model): an optional superclass. Defaults to +Jax.Model+.
   * - inner (Object): a set of methods the class will contain.
   * 
   * Creates a new Jax class inheriting from Jax.Model. If a superclass is given,
   * the model will inherit from the given superclass instead. The superclass is,
   * in turn, expected to be a subclass of Jax.Model.
   *
   * Examples:
   *
   *     var Person = Jax.Class.create({ ... });
   *     var Colin = Jax.Class.create(Person, { ... });
   *
   **/
  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Jax.Class.create(superclass, inner);
    else       klass = Jax.Class.create(Jax.Model, superclass);
    
    klass.addMethods({_klass:klass});
    return klass;
  };
  
  Jax.Model.addMethods(Jax.EventEmitter);
  
  /*
  This is touchy. Jax.World needs to be able to look up models
  that aren't necessarily in the world (using its unique ID).
  However, we want to be careful not to leave references to
  models strewn about; the user may need to garbage-collect
  them. So, we'll track them using this variable; they only
  get added to the variable upon render, and the reference
  gets deleted whenever the model is disposed.
  */
  Jax.Model.__instances = {};
  
  Object.extend(Jax.Model, model_class_methods);
})();
