Jax.RouteSet = (function() {
  return Class.create({
    initialize: function() {
      this.map = {};
    },
    
    root: function(controller, action_name) {
      action_name = action_name || "index";
      this.map.root = { 'controller': controller, 'action': action_name };
    },
    
    recognize_route: function(path) {
      if (path == "/") {
        if (!this.map.root) throw new Error("Route not recognized: '/'");
        return this.map.root;
      }
    },
    
    dispatch: function(path) {
      var route = this.recognize_route(path);
      
      Jax.current_controller = route.controller.invoke(route.action);
      if (Jax.current_controller.view_key)
        Jax.current_view = Jax.views.get(Jax.current_controller.view_key);
      
      return Jax.current_controller;
    }
  });
})();