movement = { forward: 0, backward: 0, left: 0, right: 0 }

Jax.Controller.create "oz3d",
  update: (timechange) ->
    speed = 0.15 * timechange;
    @_rotation = (@_rotation or 0) - speed
    pos = @_pos = (@_pos or vec3.create())
    radius = Math.sqrt(15*15+25*25)
    pos[0] = Math.sin(@_rotation) * radius
    pos[1] = 20
    pos[2] = Math.cos(@_rotation) * radius
    @player.camera.setPosition pos
    @player.camera.lookAt [0, 4.5, 0]
    
  mouse_dragged: (e) ->
    @light.camera.move e.diffy / 100, [0, 1, 0]
    @light.camera.move e.diffx / 100, [0, 0, 1]
    @lighto.camera.setPosition @light.camera.getPosition()

  index: ->
    @world.addObject new Jax.Framerate ema: no

    @world.ambientColor = [0.1, 0.1, 0.1, 1]
    
    @light = @world.addLight new Jax.Light.Point
      attenuation:
        linear: 0.25
      direction: vec3.normalize([0, -1/3, -1])
      # position: [0, 9, 0]
      position: [0, 9, 10]
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 1, 1, 1]
        specular: [1, 1, 1, 1]
    @light_mat = new Jax.Material.Legacy
      shininess: 0
      intensity:
        ambient: 100
    @lighto = @world.addObject new Jax.Model position: [0, 9, 0], mesh: new Jax.Mesh.Sphere(radius: 0.2, material: @light_mat)
    
    @context.player.camera.setPosition -15, 20, 25
    @context.player.camera.setDirection 0.55, -0.5, -1
    
    @floor_mat = new Jax.Material.Legacy
      shininess: 60
      color:
        diffuse: [0.4, 0.9, 0.4, 1]
        specular: [0.4, 0.4, 0.4, 1]
    @torus_mat = new Jax.Material.Legacy
      shininess: 60
      color:
        diffuse: [1.0, 0.5, 0.5, 1]
        specular: [0.6, 0.6, 0.6, 1]
    @sphere_mat = new Jax.Material.Legacy
      shininess: 60
      color:
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
