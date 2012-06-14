#= require "jax/material/illumination_layer"

class Jax.Material.LambertDiffuse extends Jax.Material.IlluminationLayer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @eyeDir = vec3.create()
    @eyePos = vec3.create()
    
  illuminate: (context, mesh, model, vars, light) ->
    vars['LightDiffuseColor[0]'] = light.color.diffuse
    vars['EyeSpaceLightDirection[0]'] = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    vars['LightType[0]'] = light.type
    vars['LightSpotExponent[0]'] = light.spotExponent
    vars['LightSpotInnerCos[0]'] = light.innerSpotAngleCos
    vars['LightSpotOuterCos[0]'] = light.outerSpotAngleCos
    vars['EyeSpaceLightPosition[0]'] = light.eyePosition context.matrix_stack.getViewMatrix(), @eyePos

    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.MaterialDiffuseIntensity = @material.intensity.diffuse
    vars.MaterialDiffuseColor = @material.color.diffuse
    vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    mesh.data.set vars, @meshDataMap
