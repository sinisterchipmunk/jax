#= require_tree .

class Jax.Material.Layer.ClampColor extends Jax.Material.Layer
  shaders:
    fragment: Jax.shaderTemplates['shaders/clamp_color/fragment']
