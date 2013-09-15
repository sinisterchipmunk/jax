#= require_tree .

class Jax.Material.Layer.VertexColor extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/vertex_color/common']
    vertex:   Jax.shaderTemplates['shaders/vertex_color/vertex']
    fragment: Jax.shaderTemplates['shaders/vertex_color/fragment']

  constructor: (options) ->
    super options
    @dataMap = colors: 'VERTEX_COLOR'
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    mesh.data.set vars, @dataMap
