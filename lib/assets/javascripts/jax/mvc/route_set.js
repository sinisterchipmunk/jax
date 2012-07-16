/**
 * class Jax.RouteSet
 * 
 * Manages routing for Jax. All routes are mapped through the route set, and
 * the route set is responsible for recognizing routes and dispatching them
 * to the appropriate destination.
 * 
 * A route is generally represented as a string of the form
 * "controller_name/action_name", where controller_name is the short name of
 * the controller and the action name is the action to be triggered. For
 * example, a route matching the #index action of the WelcomeController
 * would look like:
 * 
 *     "welcome/index"
 *   
 * A special case is the root route, which is always mapped to "/". This is
 * used to give Jax applications a default starting point. If omitted, it
 * will be necessary to invoke the appropriate controller manually. You
 * can do this by calling Jax.RouteSet#dispatch.
 **/
Jax.RouteSet = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.clear();
    },
    
    /**
     * Jax.RouteSet#clear() -> Jax.RouteSet
     *
     * Removes all routes registered with this Jax.RouteSet and then
     * returns this RouteSet.
     **/
    clear: function() {
      this._map = {};
      return this;
    },

    /**
     * Jax.RouteSet#map(path, controller) -> undefined
     * 
     * Sets up routing so that the specified name points to the given controller class.
     * Action names are not looked up until a call to #recognizeRoute is received.
     * This way, actions can be added to the controller's prototype at any time.
     **/
    map: function(path, controller) {
      if (!path) throw new Error("path is required");
      var parts = path.split(/\//);
      var controller_name = Jax.Util.underscore(parts[0]);
      this._map[controller_name] = controller;
    },
    
    /**
     * Jax.RouteSet#getControllerNames() -> Array
     *
     * Returns an array of controller names registered with this route set.
     **/
    getControllerNames: function() {
      return Jax.Util.properties(this._map);
    },
    
    /**
     * Jax.RouteSet#recognizeRoute(path) -> Object
     * - path (String): the route path to be recognized
     * 
     * Recognizes the specified path, returning an object with properties
     * 'controller' and 'action'. If the route cannot be recognized, an
     * error is thrown.
     *
     * The route path can be either the name of the controller, or
     * the format 'controller_name/action_name'. Examples:
     *
     *     'welcome'        => {controller:WelcomeController, action:'index'}
     *     'welcome/index'  => {controller:WelcomeController, action:'index'}
     *     'welcome/about'  => {controller:WelcomeController, action:'about'}
     *
     **/
    recognizeRoute: function(path) {
      var parts = path.split(/\//);
      if (parts.length > 2 || parts.length == 0)
        throw new Error("Invalid path format. String should look like 'controller/action'.");
      var controller_name = Jax.Util.underscore(parts[0]);
      var action_name = parts[1] || "index";
      
      var controller_class = this._map[Jax.Util.underscore(controller_name)];
      if (!controller_class || !controller_class.prototype)
        throw new Error("Route not recognized: '"+path+"' (controller not found)");
        
      if (!controller_class.prototype[action_name])
        throw new Error("Invalid action name '"+action_name+"' for controller '"+controller_name+"'.\n\n"+
                        "Valid action names: "+JSON.stringify(Jax.Util.properties(controller_class.prototype)));
      
      return {
        controller: controller_class,
        action: action_name
      };
    },

    /**
     * Jax.RouteSet#isRouted(path) -> Boolean
     * - path (String): the route path to be recognized
     * 
     * Returns true if the specified path can be routed, false otherwise.
     **/
    isRouted: function(path) {
      return !!self._map[path];
    },

    /**
     * Jax.RouteSet#dispatch(path) -> Jax.Controller
     * - path (String): the route path to be recognized
     * 
     * Recognizes the given path as a route and invokes its controller and action.
     * After the controller has been invoked, the controller instance itself is
     * returned.
     **/
    dispatch: function(path, context) {
      var route = this.recognizeRoute(path);
      
      return route.controller.invoke(route.action, context);
    }
  });
})();