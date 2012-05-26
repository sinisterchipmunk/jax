class Jax.Material.VertexColor extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars) ->
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
