Jax.POINT_LIGHT       = 1
Jax.SPOT_LIGHT        = 2
Jax.DIRECTIONAL_LIGHT = 3

class Jax.Light extends Jax.Model
  
  
# For legacy compatibility
# TODO remove these
Jax.Scene or= {}
Jax.Scene.LightSource = Jax.Light
