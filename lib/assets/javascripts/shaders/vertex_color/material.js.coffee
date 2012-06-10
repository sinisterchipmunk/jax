class Jax.Material.VertexColor extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @dataMap = colors: 'VERTEX_COLOR'
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    mesh.data.set vars, @dataMap
