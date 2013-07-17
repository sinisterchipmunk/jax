class Jax.Material.Wire extends Jax.Material.Surface
  @addLayer 'Wire'
  
  constructor: (options, name) ->
    # set transparent=true so that wireframes get rendered
    # back to front
    @transparent = true
    super options, name
    