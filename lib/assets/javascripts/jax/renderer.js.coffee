#= require 'jax/core'

class Jax.Renderer
  @registeredOrder: []
  
  @register: (klass) -> @registeredOrder.push klass
  
  @attemptThese: (canvas, renderers, contextOptions) ->
    for Renderer in renderers
      try
        Renderer = Jax.Renderer[renderer] unless Renderer instanceof Function
        if Renderer
          return new Renderer canvas, contextOptions
      catch e
        console.log "Instantiation of renderer #{renderer} failed with: #{e}"
    throw new Error "Could not find a compatible renderer."
    