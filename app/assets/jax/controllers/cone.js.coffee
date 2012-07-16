# Screen space ambient occlusion test
Jax.Controller.create "cones",
  update: (tc) ->
    objs = @world.getObjects()
    for obj in objs
      obj.camera.yaw tc * 0.4
    null

  index: ->
    @world.ambientColor = '#fff'
    
    # @world.addLight new Jax.Light.Directional
    #   shadows: false
    #   direction: [0, -1, 0]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Cone(sides: 4, material: new Jax.Material.Wire)
      position: [0, 0, -2]
