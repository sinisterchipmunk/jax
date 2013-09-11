class Monkey extends Jax.Controller
  Jax.controllers.add @name, this

  update: (tc) ->
    objs = @world.getObjects()
    for obj in objs
      continue if obj instanceof Jax.Framerate
      obj.camera.yaw tc * 0.4
    null

  mouse_clicked: ->
    @light.shadows = !@light.shadows

  index: ->
    @world.ambientColor = '#222'

    @world.addObject new Jax.Framerate
    
    @light = @world.addLight new Jax.Light.Directional
      shadows: true
      direction: [-1, 0, -0.5]
      color:
        diffuse: '#adf'
        specular: '#fff'

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.OBJ
        path: '/monkey-lvl2.obj'
      position: [0, 0, -2.5]
