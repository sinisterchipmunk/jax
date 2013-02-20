/**
 * class Jax.Controller
 * 
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
 *   * *mouse_rolled*    - called when the mouse wheel has been rolled
 *   * *mouse_pressed*  - called when a mouse button has been pressed.
 *   * *mouse_released* - called when a mouse button has been released.
 *   * *mouse_clicked*  - called when a mouse button has been clicked.
 *   * *key_pressed*    - called when a keyboard button has been pressed.
 *   * *key_released*   - called when a keyboard button has been released.
 *   * *key_typed*      - called when a keyboard button has been typed.
 *   * *update*         - called (approximately) 60 times per second for as long
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
 * corresponding views in this way, as a view is rendered many times -- up to a
 * target rate of 60 times per second.
 *
 **/
(function() {
  var protected_instance_method_names = [
    'initialize', 'toString', 'getControllerName', 'constructor', 'fireAction',
    'eraseResult'
  ];
  
  function is_protected(method_name) {
    for (var i = 0; i < protected_instance_method_names.length; i++)
      if (protected_instance_method_names[i] == method_name)
        return true;
    return false;
  }
  
  Jax.Controller = (function() {
    return Jax.Class.create({
      index: function() {
        /* override for scene setup */
      },
      
      /**
       * Jax.Controller#fireAction(action_name, context) -> Jax.Controller
       *
       * Erases the results of the last action, then calls the specified action. If it doesn't exist,
       * an error is raised. Finally, unless the action redirects to a different action or renders
       * a different action directly, the specified action becomes the focus of the current view.
       *
       * Returns this controller.
       **/
      fireAction: function(action_name, context) {
        if (!this.context) {
          this.context = context;
          this.world = context && context.world;
          if (!this.activeCamera)
            this.activeCamera = context.world.cameras[0];
          // TODO remove deprecated `player` from controller
          if (!this.player)
            Object.defineProperty(this, 'player', {get: function() { return context.player; }});
        }

        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");
        
        if (!this.rendered_or_redirected) {
          this.view_key = this.getControllerName()+"/"+this.action_name;
          var newView = Jax.views.find(this.view_key);
          if (newView)
            this.view = newView;
          this.rendered_or_redirected = true;
        }
        return this;
      },

      getControllerName: function() { return null; },
      
      /**
       * Jax.Controller#eraseResults() -> Jax.Controller
       *
       * Erases the results of the most recent render action. That is, whether or not it rendered
       * a different action or caused a redirect to a different action or controller is reset, and
       * the current view is set to +null+, indicating that no view will be rendered.
       *
       * Returns this controller.
       **/
      eraseResult: function() {
        this.rendered_or_redirected = false;
        this.view_key = null;
        return this;
      }
    });
  })();

  var controller_class_methods = {
    /**
     * Jax.Controller.invoke(action_name, context) -> Jax.Controller
     * - action_name (String): The name of the action to fire after initialization
     * - context (Jax.Context): The context to attach to the instantiated controller
     *
     * Creates a new instance of the specified controller, sets up its references to
     * +this.context+, +this.world+, and so on; and finally, fires the action given by
     * +action_name+.
     *
     * Returns the newly-constructed controller.
     **/
    invoke: function(action_name, context) {
      var instance = new this();
      instance.fireAction(action_name, context);
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
    
    /**
     * Jax.Controller.getControllerName() -> String
     *
     * Returns the name of the controller in question, as it is represented in +Jax.routes+.
     **/
    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name || "generic"; } });
    klass.addMethods({getControllerName: function() { return controller_name || "generic"; } });
    
    if (controller_name)
      Jax.routes.map(controller_name, klass);
      
    return klass;
  };
})();
