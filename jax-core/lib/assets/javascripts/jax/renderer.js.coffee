#= require 'jax/core'

class Jax.Renderer
  @registeredOrder: []
  
  @register: (klass) -> @registeredOrder.push klass
  
  @attemptThese: (canvas, renderers, contextOptions) ->
    for Renderer in renderers
      name = null
      try
        if Renderer instanceof Function
          name = Renderer.name
        else
          name = Renderer
          Renderer = Jax.Renderer[Renderer]
        if Renderer
          return new Renderer canvas, contextOptions
        else
          console.log "Warning: renderer '#{name}' not found!"
      catch e
        console.log "Instantiation of renderer '#{name}' failed with: #{e}"
    throw new Error "Could not find a compatible renderer."
    