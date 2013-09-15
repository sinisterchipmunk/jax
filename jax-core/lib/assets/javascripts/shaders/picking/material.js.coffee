#= require_tree .

class Jax.Material.Layer.Picking extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/picking/common']
    vertex:   Jax.shaderTemplates['shaders/picking/vertex']
    fragment: Jax.shaderTemplates['shaders/picking/fragment']
  
  setVariables: (context, mesh, model, vars) ->
    modelIndex = model.__unique_id
    modelIndex = -1 if modelIndex is undefined
    vars.INDEX = modelIndex
