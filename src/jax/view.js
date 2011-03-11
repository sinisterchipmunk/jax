/**
 * class Jax.View
 * 
 * Provides a container class around which View functions can be stored.
 * 
 * This is useful because other parts of Jax will set up helper methods and
 * delegation methods for a View to make use of.
 * 
 * For example, one of the most common tasks for a View is to clear the
 * rendering canvas:
 * 
 *     this.glClear(GL_COLOR_BIT | GL_DEPTH_BUFFER_BIT);
 *     
 * The _glClear_ method is delegated into the Jax.Context associated with
 * this view.
 * 
 * By default, in addition to all WebGL methods, the following delegates and
 * properties are created by Jax:
 * 
 *   * *world*   - the instance of Jax.World that houses all of the objects in
 *                 the scene
 *   * *player*  - the instance of Jax.Player for this context containing information
 *                 about the human user.
 *   * *context* - the instance of Jax.Context that this view is associated with.
 * 
 **/
Jax.View = (function() {
  return Jax.Class.create({
    initialize: function(view_func) {
      this.view_func = view_func;
    },
    
    render: function() {
      this.view_func();
    }
  });
})();
