#= require_tree .
#= require "jax/material/illumination_layer"

class Jax.Material.Layer.PhongSpecular extends Jax.Material.IlluminationLayer
  shaders:
    common:   Jax.shaderTemplates['shaders/phong_specular/common']
    vertex:   Jax.shaderTemplates['shaders/phong_specular/vertex']
    fragment: Jax.shaderTemplates['shaders/phong_specular/fragment']

  constructor: (options) ->
    @intensity = 1
    super options
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals: 'VERTEX_NORMAL'
    @eyeDir = vec3.create()
    @eyePos = vec3.create()
    
  illuminate: (context, mesh, model, vars, light) ->
    vars['LightSpecularColor'] = light.color.specular
    vars['EyeSpaceLightDirection'] = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    vars['LightType'] = light.type
    vars['LightSpotInnerCos'] = light.innerSpotAngleCos
    vars['LightSpotOuterCos'] = light.outerSpotAngleCos
    vars['EyeSpaceLightPosition'] = light.eyePosition context.matrix_stack.getViewMatrix(), @eyePos

    vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.MaterialShininess = @shininess
    vars.MaterialSpecularIntensity = @intensity
    vars.MaterialSpecularColor = @color
    mesh.data.set vars, @meshDataMap
