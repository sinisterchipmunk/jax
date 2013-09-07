#= require 'jax/core'

class Jax.Renderer
  @registeredOrder: []
  
  @register: (klass) -> @registeredOrder.push klass
  
  @attemptThese: (canvas, renderers, contextOptions) ->
    errors = []
    for Renderer in renderers
      name = null
      try
        if Renderer instanceof Function
          name = Renderer.name
        else
          name = Renderer
          Renderer = Jax.Renderer[Renderer]
        if Renderer
          renderer = new Renderer canvas, contextOptions
          renderer.initialize()
          return renderer
        else
          console.log "Warning: renderer '#{name}' not found!"
      catch e
        null
    throw new Error "Could not find a compatible renderer."
    