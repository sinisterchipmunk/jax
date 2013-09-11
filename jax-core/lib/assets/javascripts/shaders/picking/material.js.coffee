class Jax.Material.Layer.Picking extends Jax.Material.Layer
  
  setVariables: (context, mesh, model, vars) ->
    modelIndex = model.__unique_id
    modelIndex = -1 if modelIndex is undefined
    vars.INDEX = modelIndex
