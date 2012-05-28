#= require_self
#= require_tree "./light"

Jax.POINT_LIGHT       = 1
Jax.SPOT_LIGHT        = 2
Jax.DIRECTIONAL_LIGHT = 3

class Jax.Light extends Jax.Model
  constructor: (options) ->
    if @.__proto__.constructor.name == 'Light' # not a subclass of Light
      if options?.type
        # Handle legacy light types
        switch options.type
          when "SPOT_LIGHT", Jax.SPOT_LIGHT then options.type = "Spot"
          when "POINT_LIGHT", Jax.POINT_LIGHT then options.type = "Point"
          when "DIRECTIONAL_LIGHT", Jax.DIRECITONAL_LIGHT then options.type = "Directional"
        if Jax.Light[options.type] then return new Jax.Light[options.type](options)
    
    @enabled = true
    @attenuation = new Jax.Light.Attenuation this
    @color = new Jax.Light.Color this
    @energy = 1
    
# For legacy compatibility
# TODO remove these
Jax.Scene or= {}
Jax.Scene.LightSource = Jax.Light
