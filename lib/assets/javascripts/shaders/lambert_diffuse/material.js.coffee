#= require "jax/material/illumination_layer"

class Jax.Material.Layer.LambertDiffuse extends Jax.Material.IlluminationLayer
  constructor: (options) ->
    @intensity = 1
    super options
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @eyeDir = GLMatrix.vec3.create()
    @eyePos = GLMatrix.vec3.create()
    
  illuminate: (context, mesh, model, vars, light) ->
    vars['LightDiffuseColor'] = light.color.diffuse
    vars['LightSpotExponent'] = light.spotExponent
    vars['LightSpotInnerCos'] = light.innerSpotAngleCos
    vars['LightSpotOuterCos'] = light.outerSpotAngleCos
    vars['LightType'] = light.type
    vars['EyeSpaceLightDirection'] = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    vars['EyeSpaceLightPosition'] = light.eyePosition context.matrix_stack.getViewMatrix(), @eyePos

    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.MaterialDiffuseIntensity = @intensity
    vars.MaterialDiffuseColor = @color
    vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    mesh.data.set vars, @meshDataMap
