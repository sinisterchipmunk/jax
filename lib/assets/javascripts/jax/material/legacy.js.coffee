class Jax.Material.Legacy extends Jax.Material.Custom
  @addLayer 'Position'
  @addLayer 'VertexColor'
  
  constructor: (options, name) ->
    # don't allow layers to be passed to super. We need to
    # interpolate them here so that we can parse out deprecated
    # layer types (e.g. Lighting).

    if options
      layers = options.layers
      delete options.layers
    super options, name
    
    if layers
      for layer in layers
        if layer.type is 'Lighting'
          layer.type = 'LambertDiffuse'
          @addLayer layer
          layer.type = 'PhongSpecular'
          @addLayer layer
        else
          @addLayer layer

    for k, v of options
      for layer in @layers
        layer[k] = v
