class Jax.Light.Directional extends Jax.Light
  constructor: (options) ->
    super options
    @innerSpotAngle = Math.PI
    @outerSpotAngle = Math.PI
    @type = Jax.DIRECTIONAL_LIGHT
    @shadowmap = new Jax.ShadowMap.Directional this
    
  ###
  Directional lights must by definition always have constant
  attenuation. This property shouldn't be modified.
  ###
  @define 'attenuation',
    get: -> @_realAttenuation or= new Jax.Light.Attenuation constant: 1, linear: 0, quadratic: 0

  