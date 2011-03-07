(function() {
  Jax.Model = (function() {
    return Class.create({
      initialize: function(data) {
        for (var attribute in data)
          this[attribute] = data[attribute];
        
        if (this.after_initialize) this.after_initialize();
      }
    });
  })();
  
  var model_class_methods = {
    find: function(id) {
      for (var resource_id in this.resources) {
        if (id == resource_id)
          return new this(this.resources[id]);
      }
      throw new Error("Resource '"+id+"' not found!");
    },
    
    addResources: function(resources) {
      this.resources = this.resources || {};
      for (var id in resources)
        if (this.resources[id]) throw new Error("Duplicate resource ID: "+id);
        else this.resources[id] = resources[id];
    }
  };
  
  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Class.create(superclass, inner);
    else       klass = Class.create(Jax.Model, superclass);
    
    Object.extend(klass, model_class_methods);
    return klass;
  };
})();
