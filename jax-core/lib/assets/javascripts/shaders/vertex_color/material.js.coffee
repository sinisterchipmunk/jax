class Jax.Material.Layer.VertexColor extends Jax.Material.Layer
  constructor: (options) ->
    super options
    @dataMap = colors: 'VERTEX_COLOR'
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    mesh.data.set vars, @dataMap
