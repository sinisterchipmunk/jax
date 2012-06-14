#= require "jax/material/illumination_layer"

class Jax.Material.PhongSpecular extends Jax.Material.IlluminationLayer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals: 'VERTEX_NORMAL'
    @eyeDir = vec3.create()
    @eyePos = vec3.create()
    
  illuminate: (context, mesh, model, vars, light) ->
    vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.MaterialShininess = @material.shininess
    vars.MaterialSpecularIntensity = @material.intensity.specular
    vars.MaterialSpecularColor = @material.color.specular
    vars.LightSpecularColor = light.color.specular
    vars.EyeSpaceLightDirection = light.eyeDirection context.matrix_stack.getViewNormalMatrix(), @eyeDir
    vars.LightSpotExponent = light.spotExponent
    vars.LightSpotInnerCos = light.innerSpotAngleCos
    vars.LightSpotOuterCos = light.outerSpotAngleCos
    vars.LightType = light.type
    vars.EyeSpaceLightPosition = light.eyePosition context.matrix_stack.getViewMatrix(), @eyePos
    mesh.data.set vars, @meshDataMap
