# Attempts to implement single-pass wire frame (http://cgg-journal.com/2008-2/06/index.html) in WebGL.
Jax.Controller.create "wire",
  index: ->
    tpmesh = new Jax.Mesh.Teapot material: new Jax.Material.Wire
    
    @world.addLight new Jax.Light.Directional direction: [-1, -1, -1]
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -5]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.25, 1, 0.75, 0.5
