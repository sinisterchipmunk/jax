eye = vec3.fromValues 0, 0, 0
pos = vec3.fromValues 4, 4, 7
up  = vec3.fromValues 0, 1, 0
speed = 0.25

class Idle extends Jax.Controller
  Jax.controllers.add 'jax', this

  update: (tc) ->
    @timer -= tc * speed
    sin = Math.sin @timer
    cos = Math.cos @timer
    pos[0] = 5 * cos
    pos[2] = 5 * sin
    @activeCamera.lookAt pos, eye, up
    # HACK light is not generating shadow maps until its matrix changes
    @light?.camera.move 0

  index: ->
    @timer = 0
    @light = @world.addLight new Jax.Light.Spot
      attenuation:
        constant: 1
        linear: 0
        quadratic: 0
        # linear: 1
      shadows: true
      color:
        ambient: '#111'
        diffuse: '#eee'
        specular: '#fff'
    @light.camera.lookAt [3,3,3], [0,0,0], [0,1,0]
    # HACK this shouldn't be necessary
    @light.camera.trigger 'change'
    @update 0
    @world.addObject new Jax.Model
      castShadow: false
      mesh: new Jax.Mesh.Plane
        size: 32
        material: new Jax.Material.Surface
          intensity:
            ambient: 1
            diffuse: 1
            specular: 1
          color:
            ambient: '#0f0'
            diffuse: '#ccc'
            specular: '#555'
          shininess: 24
      position: [0, 0, 0]
      direction: [0, 1, 0]

    @world.addObject new Jax.Framerate

    # FIXME I should be able to reuse a mesh with different materials,
    # but the current API makes this either unintuitive or impossible.

    @jax1 = @world.addObject new Jax.Model
      position: [-0.062798, 0.580798,  0.486800]
      mesh: new Jax.Mesh.OBJ
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
    @jax2 = @world.addObject new Jax.Model
      position: [-0.562798, 0.580798, -0.686800]
      mesh: new Jax.Mesh.OBJ
        path: "/assets/jack.obj"
        material: new Jax.Material.Surface
          intensity:
            ambient: 1
            diffuse: 1
            specular: 1
          color:
            ambient: '#04f'
            diffuse: '#04f'
            specular: '#fff'

    @jax1.camera.setRotation [0.215122, 0.907300, 0.328824, 0.149720]
    @jax2.camera.setRotation [0.387454, 0.616156, -0.008283, -0.685695]

    @axis = 'pitch'

  # mouse_clicked: (e) ->
  #   switch @axis
  #     when 'pitch' then @axis = 'yaw'
  #     when 'yaw'   then @axis = 'roll'
  #     when 'roll'  then @axis = 'move'
  #     when 'move'  then @axis = 'pitch'

  # mouse_dragged: (e) ->
  #   # @light.camera.yaw e.diffx / 100
  #   @jax1.camera[@axis] e.diffx / 100, [0, 1, 0]
  #   