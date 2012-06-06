class Jax.Material.Legacy extends Jax.Material.Custom
  constructor: (options, name) ->
    super options, name

    @intensity =
      ambient: 1
      diffuse: 1
      specular: 1
    @shininess = 60
    @color = new Jax.Light.Color options?.color

    if options
      for key, value of options
        switch key
          when 'intensity'
            if typeof value is 'object'
              @intensity.ambient  = value.ambient  if value.ambient  isnt undefined
              @intensity.diffuse  = value.diffuse  if value.diffuse  isnt undefined
              @intensity.specular = value.specular if value.specular isnt undefined
            else
              @intensity.ambient = @intensity.diffuse = @intensity.specular = value
          when 'shininess'
            @shininess = value
          when 'color'
            if typeof value is 'object'
              @color.ambient  = Jax.Color.parse value.ambient  if value.ambient  isnt undefined
              @color.diffuse  = Jax.Color.parse value.diffuse  if value.diffuse  isnt undefined
              @color.specular = Jax.Color.parse value.specular if value.specular isnt undefined
            else
              @color.ambient  = Jax.Color.parse value
              @color.diffuse  = Jax.Color.parse value
              @color.specular = Jax.Color.parse value

    @addLayer 'Position'
    @addLayer 'VertexColor'
    @addLayer 'LightAmbient'
    @addLayer 'LambertDiffuse'
    @addLayer 'PhongSpecular'
    @addLayer 'Attenuation'
    @addLayer 'ClampColor'
