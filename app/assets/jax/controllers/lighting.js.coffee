movement = { forward: 0, backward: 0, left: 0, right: 0 }

Jax.Controller.create "lighting",
  index: ->
    @world.addObject new Jax.Framerate ema: no
    @light = @world.addLight new Jax.Light.Directional
      direction: [-1, -2, -1]
      
    @world.addObject new Jax.Model 
      position: [0, 0, -2]
      mesh: new Jax.Mesh.Teapot
      update: (tc) -> @camera.rotate tc * 0.001, [1, 0.75, 0.5]
