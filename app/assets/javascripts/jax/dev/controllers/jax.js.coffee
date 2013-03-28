eye = vec3.fromValues 0, 0, 0
pos = vec3.fromValues 4, 4, 7
speed = 0.25

Jax.Controller.create 'jax', 
  update: (tc) ->
    @timer -= tc * speed
    sin = Math.sin @timer
    cos = Math.cos @timer
    pos[0] = 5 * cos
    pos[2] = 5 * sin
    @activeCamera.lookAt eye, pos
    # HACK light is not generating shadow maps until its matrix changes
    @light?.camera.move 0

  index: ->
    @timer = 0
    @light = @world.addLight new Jax.Light.Directional
      position: [3, 3, 3]
      direction: [1, -1, 1]
      attenuation:
        linear: 1
      shadows: true
      color:
        ambient: '#222'
        diffuse: '#eee'
        specular: '#fff'
    @light.camera.rotation = [0.192552, -0.735685, -0.233828, -0.605820]
    # HACK this shouldn't be necessary
    @light.camera.fireEvent 'matrixUpdated'
    @update 0
    @world.addObject new Jax.Model
      castShadow: false
      mesh: new Jax.Mesh.Plane
        size: 8
        material: new Jax.Material.Surface
          intensity:
            ambient: 1
            diffuse: 1
            specular: 1
          color:
            ambient: '#0f0'
            diffuse: '#ccc'
            specular: '#fff'
      position: [0, 0, 0]
      direction: [0, 1, 0]

    @world.addObject new Jax.Framerate

    jaxMesh = new Jax.Mesh.OBJ
      path: "/assets/jack.obj"
      material: new Jax.Material.Surface
        intensity:
          ambient: 1
          diffuse: 1
          specular: 1
        color:
          ambient: '#f40'
          diffuse: '#f40'
          specular: '#fff'
    @jax1 = @world.addObject new Jax.Model
      position: [-0.062798, 0.580798,  0.486800]
      mesh: jaxMesh
    @jax2 = @world.addObject new Jax.Model
      position: [-0.562798, 0.580798, -0.686800]
      mesh: jaxMesh

    @jax1.camera.rotation = [0.215122, 0.907300, 0.328824, 0.149720]
    # HACK this shouldn't be necessary
    @jax1.camera.fireEvent 'matrixUpdated'

    @jax2.camera.rotation = [0.387454, 0.616156, -0.008283, -0.685695]
    @jax2.camera.fireEvent 'matrixUpdated'

    @axis = 'pitch'

  # mouse_clicked: (e) ->
  #   switch @axis
  #     when 'pitch' then @axis = 'yaw'
  #     when 'yaw'   then @axis = 'roll'
  #     when 'roll'  then @axis = 'move'
  #     when 'move'  then @axis = 'pitch'

  # mouse_dragged: (e) ->
  #   # @light.camera.yaw e.diffx / 100
  #   # @jax1.camera[@axis] e.diffx / 100, [0, 1, 0]
  #   