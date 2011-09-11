/* Used by endpoints to pull in application-specific logic. */

//= require "jax"
//= require_everything_matching "helpers"
//= require_everything_matching "models"
//= require_everything_matching "views"
//= require_everything_matching "controllers"
//= require_everything_matching "resources"
//= require_everything_matching "shaders"

for (var shaderName in Jax._shader_data) {
  if (!(Jax.shaders[shaderName] instanceof Jax.Shader)) {
    var descriptor = Jax._shader_data[shaderName];
    Jax.shaders[shaderName] = new Jax.Shader(descriptor);
  }
}
