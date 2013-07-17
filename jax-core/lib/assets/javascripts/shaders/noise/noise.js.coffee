class Jax.Material.Layer.Noise extends Jax.Material.Layer
  setVariables: (context, mesh, model, vars, pass) ->
    Jax.noise.prepare context unless Jax.noise.isPrepared context
    vars.gradTexture = Jax.noise.grad
