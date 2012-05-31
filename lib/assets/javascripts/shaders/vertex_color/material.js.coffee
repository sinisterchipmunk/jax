class Jax.Material.VertexColor extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.set
      PASS: pass
      WorldAmbientColor: new Jax.Color(0.3, 0.3, 0.3, 1).toVec4()
      MaterialAmbientIntensity: 1
      
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
