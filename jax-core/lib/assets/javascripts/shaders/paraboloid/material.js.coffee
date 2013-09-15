#= require_tree .

class Jax.Material.Layer.Paraboloid extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/paraboloid/common']
    vertex:   Jax.shaderTemplates['shaders/paraboloid/vertex']
    fragment: Jax.shaderTemplates['shaders/paraboloid/fragment']

  constructor: (options) ->
    super options
    @_meshMap =
      vertices: 'VERTEX_POSITION'
  
  setVariables: (context, mesh, model, vars, pass) ->
    direction = @direction
    if direction isnt 1 and direction isnt -1
      throw new Error "`direction` must be either 1 or -1"
      
    mesh.data.set vars, @_meshMap
    vars.ModelView = context.matrix_stack.getModelViewMatrix()
    vars.Near = @paraboloidNear || 1
    vars.Far  = @paraboloidFar  || 1
    vars.Direction = direction
  