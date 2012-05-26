class Jax.Material.Lighting extends Jax.Material.Layer
  constructor: (options, material) ->
    options or= {}
    options or= "lighting"
    @vnMatrix = mat3.create()
    super options, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    stack = context.matrix_stack
    light = context.world.lighting.getLight()
    mat3.transpose mat4.toMat3 stack.getViewMatrix(), @vnMatrix
    
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
      normals:  'VERTEX_NORMAL'
      vertices: 'VERTEX_POSITION'
      textures: 'VERTEX_TEXCOORDS'

    vars.set
      ivMatrix: stack.getInverseViewMatrix()
      mvMatrix: stack.getModelViewMatrix()
      nMatrix: stack.getNormalMatrix()
      vnMatrix: @vnMatrix
      # materialAmbient: @ambient
      # materialDiffuse: @diffuse
      # materialSpecular: @specular
      materialShininess: 1
      LIGHTING_ENABLED: context.world.lighting.isEnabled() && !(model.unlit),
      LIGHT_POSITION: light.getPosition(),
      LIGHT_DIRECTION: light.getDirection(),
      LIGHT_AMBIENT: light.getAmbientColor(),
      LIGHT_DIFFUSE: light.getDiffuseColor(),
      LIGHT_SPECULAR: light.getSpecularColor(),
      LIGHT_ATTENUATION_CONSTANT: light.getConstantAttenuation(),
      LIGHT_ATTENUATION_LINEAR: light.getLinearAttenuation(),
      LIGHT_ATTENUATION_QUADRATIC: light.getQuadraticAttenuation(),
      LIGHT_SPOT_EXPONENT: light.getSpotExponent(),
      LIGHT_SPOT_COS_CUTOFF: light.getSpotCosCutoff(),
      LIGHT_ENABLED: light.isEnabled(),
      LIGHT_TYPE: light.getType()
