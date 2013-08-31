class Jax.Material.Layer.Noise extends Jax.Material.Layer
  setVariables: (context, mesh, model, vars, pass) ->
    Jax.noise or= new Jax.Noise()
    vars.gradTexture = Jax.noise.grad
