class Jax.Material.Layer.Depthmap extends Jax.Material.Layer
  setVariables: (context, mesh, model, vars, pass) ->
    # Don't take depth maps of models not intended to create them
    return false unless model.castShadow
    