class Jax.Material.VertexColor extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @worldColor = new Jax.Color()
    
  setVariables: (context, mesh, model, vars, pass) ->
    if context.world.lights.length == 0
      @worldColor.set 1, 1, 1, 1
    else
      @worldColor.set 0.05, 0.05, 0.05, 1
    
    vars.set
      PASS: pass
      WorldAmbientColor: @worldColor.toVec4()
      MaterialAmbientIntensity: @material.intensity.ambient
      
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
