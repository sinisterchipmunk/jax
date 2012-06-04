movement = { forward: 0, backward: 0, left: 0, right: 0 }

Jax.Controller.create "oz3d",
  update: (timechange) ->
    speed = 0.00015 * timechange;
    @_rotation = (@_rotation or 0) - speed
    pos = @_pos = (@_pos or vec3.create())
    radius = Math.sqrt(15*15+25*25)
    pos[0] = Math.sin(@_rotation) * radius
    pos[1] = 20
    pos[2] = Math.cos(@_rotation) * radius
    @player.camera.setPosition pos
    @player.camera.lookAt [0, 4.5, 0]

  index: ->
    @world.ambientColor = [0.1, 0.1, 0.1, 1]
    
    @light = @world.addLight new Jax.Light.Directional
      direction: vec3.normalize([0, -1/3, -1])
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 1, 1, 1]
        specular: [1, 1, 1, 1]
    
    @context.player.camera.setPosition -15, 20, 25
    @context.player.camera.setDirection 0.55, -0.5, -1
    
    @floor_mat = new Jax.Material.Legacy
      shininess: 60
      color:
        ambient: [0.7, 0.7, 0.7, 1]
        diffuse: [0.4, 0.9, 0.4, 1]
        specular: [0.4, 0.4, 0.4, 1]
    
    @torus_mat = new Jax.Material.Legacy
      shininess: 60
      color:
        ambient: [0.3, 0.3, 0.3, 1]
        diffuse: [0.9, 0.5, 0.5, 1]
        specular: [0.6, 0.6, 0.6, 1]
    @sphere_mat = new Jax.Material.Legacy
      shininess: 60
      color:
        ambient: [0.3, 0.3, 0.3, 1]
        diffuse: [0.5, 0.5, 0.9, 1]
        specular: [0.4, 0.4, 0.4, 1]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Plane
        size: 50
        segments: 20
        material: @floor_mat
      direction: [0, 1, 0]
    
    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Torus
        outer_radius: 5
        inner_radius: 1.5
        material: @torus_mat
      position: [-7, 5, 0]
      direction: [0, 1, 0]
      
    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
        radius: 4
        stacks: 40
        slices: 40
        material: @sphere_mat
      position: [7, 4, 0]
