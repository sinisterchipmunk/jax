class Jax.Material.VertexColor extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars) ->
    vars.set 'VERTEX_COLOR', mesh.getColorBuffer()
