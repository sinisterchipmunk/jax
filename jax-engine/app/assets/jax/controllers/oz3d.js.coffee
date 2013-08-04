movement = { forward: 0, backward: 0, left: 0, right: 0 }
radius = Math.sqrt 15*15 + 25*25

Jax.Controller.create "oz3d",
  update: (timechange) ->
    speed = 0.15 * timechange;
    @_rotation = (@_rotation or 0) - speed
    pos = @_pos = (@_pos or vec3.create())
    pos[0] = Math.sin(@_rotation) * radius
    pos[1] = 20
    pos[2] = Math.cos(@_rotation) * radius
    @context.activeCamera.position = pos
    @context.activeCamera.lookAt [0, 4.5, 0]

  mouse_scrolled: (e) ->
    radius += e.wheelDeltaY * 0.25
    radius = 0.25 if radius < 0.25
    
  mouse_dragged: (e) ->
    @light.camera.move e.diffy / 100, [0, 1, 0]
    @light.camera.move e.diffx / 100, [0, 0, 1]
    @lighto.camera.position = @light.camera.position unless @light instanceof Jax.Light.Directional
    
  key_released: (e) ->
    @world.removeLight @light
    switch ++@lightType % 3
      when 0 then @light = new Jax.Light.Point       @lightOptions
      when 1 then @light = new Jax.Light.Directional @lightOptions
      when 2 then @light = new Jax.Light.Spot        @lightOptions
    @world.addLight @light

  index: ->
    @world.addObject new Jax.Framerate ema: no

    @world.ambientColor = [0.1, 0.1, 0.1, 1]
    @lightType = 1
    @lightOptions =
      shadows: true
      attenuation:
        linear: 0.25
      position: [0, 15, 10]
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 1, 1, 1]
        specular: [1, 1, 1, 1]
    
    @light_mat = new Jax.Material.Surface
      shininess: 0
      intensity:
        ambient: 100
    @lighto = @world.addObject new Jax.Model
      position: @lightOptions.position
      castShadow: false
      receiveShadow: false
      illuminated: false
      mesh: new Jax.Mesh.Sphere(radius: 0.2, material: @light_mat)
    @lighto.camera.lookAt [0,0,-3]
    @lightOptions.direction = @lighto.camera.direction
    @light = @world.addLight new Jax.Light.Directional @lightOptions
    
    @context.activeCamera.position = [-15, 20, 25]
    @context.activeCamera.direction = [ 0.55, -0.5, -1]
    
    @floor_mat = new Jax.Material.Surface
      shininess: 60
      color:
        diffuse: [0.4, 0.9, 0.4, 1]
        specular: [0.4, 0.4, 0.4, 1]
    @torus_mat = new Jax.Material.Surface
      shininess: 60
      color:
        diffuse: [1.0, 0.5, 0.5, 1]
        specular: [0.6, 0.6, 0.6, 1]
    @sphere_mat = new Jax.Material.Surface
      shininess: 60
      color:
        diffuse: [0.5, 0.5, 0.9, 1]
        specular: [0.4, 0.4, 0.4, 1]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Plane
        size: 50
        segments: 20
        material: @floor_mat
      castShadow: false
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
