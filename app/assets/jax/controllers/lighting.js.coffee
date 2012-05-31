Jax.Controller.create "lighting",
  index: ->
    @world.addLight new Jax.Light.Directional
    @world.addObject new Jax.Model position: [0, 0, -5], mesh: new Jax.Mesh.Sphere
