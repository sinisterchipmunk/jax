class Jax.Material.LambertDiffuse extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @varMap = {}
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    return unless pass
    
    light = context.world.lights[pass-1]
    @varMap.NormalMatrix = context.matrix_stack.getNormalMatrix()
    @varMap.PASS = pass
    @varMap.MaterialDiffuseIntensity = @material.intensity.diffuse
    @varMap.MaterialDiffuseColor = @material.color.diffuse
    @varMap.LightDiffuseColor = light.color.diffuse
    @varMap.EyeSpaceLightDirection = light.eyeSpaceDirection context.matrix_stack
    
    mesh.data.set vars, @meshDataMap
    vars.set @varMap
