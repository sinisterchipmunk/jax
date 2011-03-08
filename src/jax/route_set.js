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
  function set_route(self, path, route_descriptor) {
    return self._map[path] = route_descriptor;
  }
  
  function find_route(self, path) {
    return self._map[path] || null;
  }
  
  return Class.create({
    initialize: function() {
      this.clear();
    },
    
    clear: function() {
      this._map = {};
    },

    /**
     * Jax.RouteSet#root(controller, actionName) -> Object
     * - controller (Jax.Controller): the controller that will be routed to
     * - actionName (String): the name of the action to be invoked by this route
     * 
     * Note that the controller is expected to be a subclass of Jax.Controller.
     * 
     * Example:
     * 
     *     Jax.routes.root(WelcomeController, "index");
     * 
     **/
    root: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, "/", this.getRouteDescriptor.apply(this, args));
    },
    
    /**
     **/
    map: function(path) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, path, this.getRouteDescriptor.apply(this, args));
    },
    
    getRouteDescriptor: function() {
      var route_descriptor;
      switch(arguments.length) {
        case 1:
          if (typeof(arguments[0]) == "object")
          {
            route_descriptor = arguments[0];
            if (!route_descriptor.action) route_descriptor.action = "index";
            return arguments[0];
          }
          else return { controller: arguments[0], action: "index" };
        case 2: return { controller: arguments[0], action: arguments[1] };
        case 3:
          route_descriptor = arguments[3];
          route_descriptor.controller = arguments[0];
          route_descriptor.action = arguments[1];
          return route_descriptor;
        default: throw new Error("Invalid arguments");
      };
    },
    
    /**
     * Jax.RouteSet#recognize_route(path) -> Object
     * - path (String): the route path to be recognized
     * 
     * Recognizes the specified path, returning an object with properties
     * 'controller' and 'action'. If the route cannot be recognized, an
     * error is thrown.
     **/
    recognize_route: function(path) {
      var route = find_route(this, path);
      if (!route) throw new Error("Route not recognized: '"+path+"'");
      return route;
    },

    /**
     * Jax.RouteSet#isRouted(path) -> Boolean
     * - path (String): the route path to be recognized
     * 
     * Returns true if the specified path can be routed, false otherwise.
     **/
    isRouted: function(path) {
      return !!find_route(this, path);
    },

    /**
     * Jax.RouteSet#dispatch(path) -> Jax.Controller
     * - path (String): the route path to be recognized
     * 
     * Recognizes the given path as a route and invokes its controller and action.
     * After the controller has been invoked, the controller instance itself is
     * returned.
     **/
    dispatch: function(path) {
      var route = this.recognize_route(path);
      
      return route.controller.invoke(route.action);
    }
  });
})();