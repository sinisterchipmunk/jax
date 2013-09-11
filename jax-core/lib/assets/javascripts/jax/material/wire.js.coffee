class Jax.Material.Wire extends Jax.Material.Surface
  constructor: (options, name) ->
    # set transparent=true so that wireframes get rendered
    # back to front
    @transparent = true
    @addLayer 'Wire'
    super options, name
