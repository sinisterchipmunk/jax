class Jax.Material.Legacy extends Jax.Material.Custom
  @define 'ambient',
    get: -> @_ambient
    set: (c) ->
      @_ambient = Jax.Color.parse c
      @findLayer(Jax.Material.Layer.LightAmbient)?.color = @_ambient

  @define 'diffuse',
    get: -> @_diffuse
    set: (c) ->
      @_diffuse = Jax.Color.parse c
      @findLayer(Jax.Material.Layer.LambertDiffuse)?.color = @_diffuse

  @define 'specular',
    get: -> @_specular
    set: (c) ->
      @_specular = Jax.Color.parse c
      @findLayer(Jax.Material.Layer.PhongSpecular)?.color = @_specular

  @define 'shininess',
    get: -> @_shininess
    set: (c) ->
      @_shininess = c
      @findLayer(Jax.Material.Layer.PhongSpecular)?.shininess = @_shininess

  constructor: (options, name) ->
    @addLayer 'Position'
    @addLayer 'VertexColor'

    # don't allow layers to be passed to super. We need to
    # interpolate them here so that we can parse out deprecated
    # layer types (e.g. Lighting).
    if options
      layers = options.layers
      delete options.layers
    super options, name
    if layers
      for layer in layers
        switch layer.type
          when 'Lighting'
            layer.type = 'LightAmbient'
            @addLayer layer
            layer.type = 'LambertDiffuse'
            @addLayer layer
            layer.type = 'PhongSpecular'
            @addLayer layer
          when 'NormalMap'
            @insertLayer 0, layer
          else
            @addLayer layer

    # Re-apply all values because they may have been set before layers
    # existed to receive them
    @ambient   = @ambient   || '#ffff'
    @diffuse   = @diffuse   || '#ffff'
    @specular  = @specular  || '#ffff'
    if @shininess is undefined
      @shininess = 60

