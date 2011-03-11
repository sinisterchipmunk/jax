/**
 * class Jax.ViewManager
 * 
 **/
Jax.ViewManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.views = {};
    },

    /**
     * Jax.ViewManager#push(path, view) -> undefined
     * - path (String): the view path to be stored
     * - view (Function): a function to be called when rendering the view
     * 
     * If the path is already stored, the current one will be replaced.
     **/
    push: function(path, view) {
      this.views[path] = view;
    },
    
    /**
     * Jax.ViewManager#get(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    get: function(path) {
      if (this.views[path])
        return new Jax.View(this.views[path]);
      else throw new Error("Could not find view at '"+path+"'!");
    },

    /** alias of: Jax.ViewManager#get
     * Jax.ViewManager#find(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    find: function(path) { return this.get(path); }
  });
})();
