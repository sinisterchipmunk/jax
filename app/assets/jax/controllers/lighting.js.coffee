Jax.Controller.create "lighting",
  index: ->
    # @world.addObject new Jax.Framerate ema: no
    @world.addLight new Jax.Light.Directional
    @world.addObject new Jax.Model 
      position: [0, 0, -5]
      mesh: new Jax.Mesh.Sphere
      update: (tc) -> @camera.rotate tc * 0.001, [0, 1, 0]
