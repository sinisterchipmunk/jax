(function() {
  Jax.Controller = (function() {
    return Class.create({
      initialize: function() {
        
      }
    });
  })();
  
  var controller_class_methods = {
    invoke: function(action_name) {
      
    }
  };
  
  Jax.Controller.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Class.create(superclass, inner);
    else       klass = Class.create(Jax.Model, superclass);
    
    Object.extend(klass, controller_class_methods);
    return klass;
  };
})();
