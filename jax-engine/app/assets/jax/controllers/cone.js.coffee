Jax.Controller.create "cones",
  update: (tc) ->
    objs = @world.getObjects()
    for obj in objs
      continue if obj instanceof Jax.Framerate
      obj.camera.yaw tc * 0.4
    null

  index: ->
    @world.ambientColor = '#fff'

    @world.addObject new Jax.Framerate
    
    @world.addLight new Jax.Light.Directional
      shadows: false
      direction: [0, -1, 0]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Cone(sides: 3, size: 0.5, material: new Jax.Material.Wire)
      position: [-1, 0, -3]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Cone(sides: 4, size: 0.5, material: new Jax.Material.Wire)
      position: [0, 0, -3]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Cone(sides: 8, size: 0.5, material: new Jax.Material.Wire)
      position: [1, 0, -3]
