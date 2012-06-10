class Jax.Material.LambertDiffuse extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @eyeDir = vec3.create()
    @eyePos = vec3.create()
    
  numPasses: (context) -> context.world.lights.length + 1
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    return unless pass
    
    light = context.world.lights[pass-1]
    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.MaterialDiffuseIntensity = @material.intensity.diffuse
    vars.MaterialDiffuseColor = @material.color.diffuse
    vars.LightDiffuseColor = light.color.diffuse
    vars.EyeSpaceLightDirection = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    vars.LightType = light.type
    vars.LightSpotExponent = light.spotExponent
    vars.LightSpotInnerCos = light.innerSpotAngleCos
    vars.LightSpotOuterCos = light.outerSpotAngleCos
    vars.EyeSpaceLightPosition = light.eyePosition context.matrix_stack.getViewMatrix(), @eyePos
    vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    mesh.data.set vars, @meshDataMap
