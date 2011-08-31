//= require_self
//= require "jax/webgl/scene/frustum"
//= require "jax/webgl/scene/light_manager"

/**
 * Jax.Scene
 *
 **/
Jax.Scene = {};

/* used by some shaders to determine what kind of shading is to be done.
 * This is stored in context.world.current_pass.
 */
Jax.Scene.ILLUMINATION_PASS = 1;
Jax.Scene.AMBIENT_PASS = 2;
Jax.Scene.SHADOWMAP_PASS = 3;
