#= require_tree .
#= require "jax/material/illumination_layer"

class Jax.Material.Layer.LambertDiffuse extends Jax.Material.IlluminationLayer
  shaders:
    common:   Jax.shaderTemplates['shaders/lambert_diffuse/common']
    vertex:   Jax.shaderTemplates['shaders/lambert_diffuse/vertex']
    fragment: Jax.shaderTemplates['shaders/lambert_diffuse/fragment']

  constructor: (options) ->
    @intensity = 1
    super options
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @eyeDir = vec3.create()
    @eyePos = vec3.create()
    
  illuminate: (context, mesh, model, vars, light) ->
    vars['LightDiffuseColor'] = light.color.diffuse
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
