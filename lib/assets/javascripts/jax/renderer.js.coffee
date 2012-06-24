#= require_self
#= require_tree "./renderer"

class Jax.Renderer
  @attemptThese: (canvas, renderers, contextOptions) ->
    for renderer in renderers
      try
        if Renderer = Jax.Renderer[renderer]
          return new Renderer canvas, contextOptions
        else throw new Error "BUG: class Jax.Renderer.#{renderer} not found!"
      catch e
        console.log "Instantiation of renderer #{renderer} failed with: #{e}"
        console.log "Trying to use a different one..."
    throw new Error "Could not find a compatible renderer."
    