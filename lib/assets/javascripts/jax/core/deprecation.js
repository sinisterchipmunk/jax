Jax.deprecate = function(owner, old_func, new_func, message) {
  owner.prototype[old_func] = function() {
    if (this[new_func]) {
      message = message || "`"+owner.name+"."+old_func+"` has been deprecated. Please use `"+owner.name+"."+new_func+"` instead.";
      console.log(message);
      return this[new_func].apply(this, arguments);
    } else {
      message = message || "`"+owner.name+"."+old_func+"` has been deprecated. Please see the documentation.";
      throw new Error(message);
    }
  };
};

/** deprecated
 * vec3.distance(a, b[, dest]) -> vec3
 *
 * Deprecated. Please use `vec3.dist(a, b[, dest])` instead.
 **/
Jax.deprecate(vec3, 'distance', 'dist');

/** deprecated
 * Jax.RouteSet#root(controller, actionName) -> undefined
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
Jax.deprecate(Jax.RouteSet, 'root', null, 
  "Jax.RouteSet#root is deprecated. Instead, please use\n" +
  "  `new Jax.Context(canvas, {root:'controller/action'})`\n"+
  "or redirect explicitly with \n"+
  "  `context.redirectTo('controller/action')`"
);

/** deprecated
 * Jax.Camera#orient(viewVector, upVector[, positionVector]) -> Jax.Camera
 * - viewVector (vec3): the new direction that the camera will be pointing
 * - upVector (vec3): the new "up" direction perpendicular to the view
 * - positionVector (vec3): optionally, a new position for the camera
 * Jax.Camera#orient(vx, vy, vz, ux, uy, uz[, px, py, pz]) -> Jax.Camera
 * 
 * Reorients this camera to be looking in the specified direction.
 * Optionally, repositions this camera.
 *
 * **Deprecated.** Please use Jax.Camera#setDirection instead.
 **/
Jax.deprecate(Jax.Camera, 'orient', 'reorient');

/** deprecated
 * Jax.Framebuffer#getTextureBuffer(context, index) -> Jax.Texture
 *
 * This method is deprecated. See Jax.Framebuffer#getTexture instead.
 **/
Jax.deprecate(Jax.Framebuffer, 'getTextureBuffer', 'getTexture');

/** deprecated
 * Jax.Framebuffer#getTextureBufferHandle(context, index) -> WebGLTexture
 *
 * This method is deprecated. See Jax.Framebuffer#getTextureHandle instead.
 **/
Jax.deprecate(Jax.Framebuffer, 'getTextureBufferHandle', 'getTextureHandle');
