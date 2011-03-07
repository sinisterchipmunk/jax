(function() {
  Jax.Controller = (function() {
    return Class.create({
      initialize: function(action_name) {
        alert(this.action_name);
        this.action_name = action_name;
        this[action_name].call(this, []);
      }
    });
  })();

  var controller_class_methods = {
    invoke: function(action_name) {
      return new this(action_name);
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
