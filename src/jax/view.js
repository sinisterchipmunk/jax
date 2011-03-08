Jax.View = (function() {
  return Class.create({
    initialize: function(view_func) {
      this.view_func = view_func;
    },
    
    render: function() {
      this.view_func();
    }
  });
})();
