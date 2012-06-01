class Jax.Material.AmbientAttenuated extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
    @varMap = {}
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    return unless pass
    
    light = context.world.lights[pass-1]
    @varMap.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    @varMap.PASS = pass
    @varMap.MaterialAmbientIntensity = @material.intensity.ambient
    @varMap.LightAmbientColor = light.color.ambient
    
    mesh.data.set vars, @meshDataMap
    vars.set @varMap
