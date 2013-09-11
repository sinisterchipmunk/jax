# Attempts to implement single-pass wire frame (http://cgg-journal.com/2008-2/06/index.html) in WebGL.
class Wire extends Jax.Controller
  Jax.controllers.add @name, this

  index: ->
    tpmesh = new Jax.Mesh.Teapot
      material: new Jax.Material.Wire
    
    @point = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 0, 0, 1]
        specular: [1, 0, 0, 1]
      position: [-20, 0, 0]
      direction: [20, 0, -25]
    
    @world.addLight new Jax.Light.Directional
      shadows: false
      direction: [-1, -1, -1]
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -3]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.25, [1, 0.75, 0.5]
