/**
 * class Jax.ViewManager
 * 
 * Maintains a registry of all Jax views and the paths to them.
 **/
Jax.ViewManager = (function() {
  function ViewManager() {
    this.views = {};
  }

  jQuery.extend(ViewManager.prototype, {

    /**
     * Jax.ViewManager#push(path, view) -> undefined
     * - path (String): the view path to be stored
     * - view (Function): a function to be called when rendering the view
     * 
     * If the path is already stored, the current one will be replaced.
     **/
    push: function(path, view) {
      this.views[Jax.Util.underscore(path)] = view;
    },
    
    /**
     * Jax.ViewManager#get(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    find: function(path) {
      if (this.views[Jax.Util.underscore(path)])
        return this.views[Jax.Util.underscore(path)];
      return null;
    },
    
    /**
     * Jax.ViewManager#remove(path) -> Object | undefined
     * - path (String): the view path to be removed.
     *
     * Removes the specified view path and, if it existed to begin with, returns it.
     * Otherwise undefined is returned.
     **/
    remove: function(path) {
      var result = this.views[Jax.Util.underscore(path)];
      delete this.views[Jax.Util.underscore(path)];
      return result;
    },
    
    /**
     * Jax.ViewManager#exists(path) -> Boolean
     *
     * Returns true if a view exists for the specified view path, false otherwise.
     **/
    exists: function(path) {
      return !!this.views[Jax.Util.underscore(path)];
    }
  });

  return ViewManager;
})();
