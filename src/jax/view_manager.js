Jax.ViewManager = (function() {
  return Class.create({
    initialize: function() {
      this.views = {};
    },
    
    push: function(path, view) {
      this.views[path] = new Jax.View(view);
    },
    
    get: function(path) {
      if (this.views[path])
        return this.views[path];
      else throw new Error("Could not find view at '"+path+"'!");
    }
  });
})();
