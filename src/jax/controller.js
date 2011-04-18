/**
 * class Jax.Controller
 * Controllers are a major component of the Jax framework, because they are in
 * charge of receiving input from the user, setting up a scene, tearing it down,
 * and deciding when is the right time to transition to a different controller.
 * 
 * Controllers need to be either registered with Jax.routes or invoked using
 * Jax.Controller.invoke(). They are not intended to be instantiated directly,
 * so you should avoid doing this in your code and instead rely on the route set.
 * 
 * Methods added to controllers are called actions. You can name actions whatever
 * you want, but some action names serve special purposes. They are as follows:
 * 
 *   * *index*          - called when the action name is omitted from a route.
 *   * *destroy*        - called when leaving the current controller.
 *   * *mouse_clicked*  - called when the mouse is clicked within the canvas.
 *   * *mouse_entered*  - called when the mouse enters the canvas.
 *   * *mouse_exited*   - called when the mouse exits the canvas.
 *   * *mouse_moved*    - called when the mouse is moved, unless a button is pressed.
 *   * *mouse_dragged*  - called when the mouse is moved while a button is pressed.
 *   * *mouse_pressed*  - called when a mouse button has been pressed.
 *   * *mouse_released* - called when a mouse button has been released.
 *   * *mouse_clicked*  - called when a mouse button has been clicked.
 *   * *key_pressed*    - called when a keyboard button has been pressed.
 *   * *key_released*   - called when a keyboard button has been released.
 *   * *key_typed*      - called when a keyboard button has been typed.
 *   * *update*         - called (approximately) every 60 milliseconds for as long
 *   as a controller is active. Time difference in seconds is passed as an arguments.
 *   
 * Example:
 * 
 *     var WelcomeController = Jax.Controller.Create("welcome", ApplicationController, {
 *       index: function() {
 *         // ...
 *       },
 *       
 *       mouse_clicked: function(event) {
 *         // ...
 *       },
 *       
 *       update: function(timechange) {
 *        // it's been [timechange] seconds since last update
 *       }
 *     });
 *
 * With the exception of event actions, which will be fired every time an event occurs,
 * controller actions are only triggered once for a given controller unless they
 * explicitly trigger other actions by calling them directly. They differ from their
 * corresponding views (see Jax.View) in this way, as a view is rendered many times
 * -- up to a target rate of 60 passes per second.
 **/
(function() {
  var protected_instance_method_names = [
    'initialize', 'toString', 'getControllerName', 'constructor', 'isKindOf', 'fireAction',
    'eraseResult'
  ];
  
  function is_protected(method_name) {
    for (var i = 0; i < protected_instance_method_names.length; i++)
      if (protected_instance_method_names[i] == method_name)
        return true;
    return false;
  }
  
  Jax.Controller = (function() {
    function setViewKey(self) {
      self.view_key = self.getControllerName()+"/"+self.action_name;
      self.rendered_or_redirected = true;
    }
    
    return Jax.Class.create({
      fireAction: function(action_name) {
        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");
        
        if (!this.rendered_or_redirected)
          setViewKey(this);
      },
      
      eraseResult: function() {
        this.rendered_or_redirected = false;
        this.view_key = null;
      }
    });
  })();

  var controller_class_methods = {
    invoke: function(action_name, context) {
      var instance = new this();
      instance.context = context;
      instance.world = context && context.world;
      instance.player = context && context.player;
      instance.fireAction(action_name);
      return instance;
    }
  };

  /**
   * Jax.Controller.create(controllerName, methods) -> Class
   * Jax.Controller.create(controllerName, superclass, methods) -> Class
   * - controllerName (String): the short name of this controller
   * - superclass (Class): a parent class to inherit from
   * - methods (Object): a set of methods to be added to the Class
   * 
   * The controllerName must be the short name of the controller, as represented
   * in Jax.RouteSet. An example controller name for a WelcomeController would be
   * "welcome".
   * 
   * If superclass is not given, Jax.Controller is used as the superclass instead.
   * 
   * The methods object follows the same structure as Prototype.
   * 
   * Example:
   * 
   *     var WelcomeController = Jax.Controller.Create("welcome", ApplicationController, {
   *       index: function() {
   *         // ...
   *       },
   *       
   *       mouse_clicked: function(event) {
   *         // ...
   *       }
   *     });
   **/
  Jax.Controller.create = function(controller_name, superclass, inner) {
    if (typeof(controller_name) != "string")
    {
      inner = superclass;
      superclass = controller_name;
      controller_name = "generic";
    }
    
    var klass;
    if (inner) klass = Jax.Class.create(superclass,     inner);
    else       klass = Jax.Class.create(Jax.Controller, superclass);
    
    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name; } });
    klass.addMethods({getControllerName: function() { return controller_name; } });
    
    // we already know the controller name and all its actions, so may as well
    // set up routing here.
    for (var method_name in klass.prototype)
    {
      if (!is_protected(method_name)) {
        // it's not a protected name, so treat it as an action
        Jax.routes.map(controller_name+"/"+method_name, klass, method_name);
      }
    }
    
    return klass;
  };
})();
