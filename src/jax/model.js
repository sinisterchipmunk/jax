/**
 * class Jax.Model
 * 
 **/
(function() {
  Jax.Model = (function() {
    return Jax.Class.create({
      initialize: function(data) {
        var attribute, defs;
        
        if (this._klass && this._klass.resources && (defs = this._klass.resources['default']))
          for (attribute in defs)
            this[attribute] = defs[attribute];
        
        if (data)
          for (attribute in data)
            this[attribute] = data[attribute];
        
        if (this.after_initialize) this.after_initialize();
      },

      /**
       * Jax.Model#inspect() -> String
       * 
       * Returns the JSON representation of the attributes in this model.
       * Function definitions are not included.
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
    }
  };
  
  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Jax.Class.create(superclass, inner);
    else       klass = Jax.Class.create(Jax.Model, superclass);
    
    klass.addMethods({_klass:klass});
    
    Object.extend(klass, model_class_methods);
    return klass;
  };
})();
