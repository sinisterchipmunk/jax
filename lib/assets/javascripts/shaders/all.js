//= require_all_shaders
// 

for (var shaderName in Jax._shader_data) {
  if (!(Jax.shaders[shaderName] instanceof Jax.Shader)) {
    var descriptor = Jax._shader_data[shaderName];
    Jax.shaders[shaderName] = new Jax.Shader(descriptor);
  }
}
