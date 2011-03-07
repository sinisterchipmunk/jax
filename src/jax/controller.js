(function() {
  Jax.Controller = (function() {
    return Class.create({
      initialize: function() {
      },
      
      fire_action: function(action_name) {
        this.action_name = action_name;
        this.renderedOrRedirected = false;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");
        
        if (!this.renderedOrRedirected)
          this.render();
      },
      
      render: function() {
        this.view_key = this.getControllerName()+"/"+this.action_name;
        this.renderedOrRedirected = true;
      }
    });
  })();

  var controller_class_methods = {
    invoke: function(action_name) {
      var instance = new this();
      instance.fire_action(action_name);
      return instance;
    }
  };
  
  Jax.Controller.create = function(controller_name, superclass, inner) {
    if (typeof(controller_name) != "string")
    {
      inner = superclass;
      superclass = controller_name;
      controller_name = "generic";
//      throw new Error("Controller name must be a string");
    }
    
    var klass;
    if (inner) klass = Class.create(superclass,     inner);
    else       klass = Class.create(Jax.Controller, superclass);
    
    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name; } });
    klass.addMethods({getControllerName: function() { return controller_name; } });
    
    return klass;
  };
})();
