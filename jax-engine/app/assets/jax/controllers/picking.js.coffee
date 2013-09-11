class Picking extends Jax.Controller
  Jax.controllers.add @name, this

  update: (tc) ->
    objs = @world.getObjects()
    @clock or= 0
    @clock += tc
    pos = [0,0,0]
    i = 0
    for obj in objs
      pos[0] = Math.cos(@clock + i)
      pos[1] = Math.sin(@clock + i)
      pos[2] = Math.sin(@clock + i)
      i += Math.PI
      obj.camera.setPosition pos
      obj.mesh.setColor '#fff'
    if @picked = @world.pick @mouse.x, @mouse.y
      @picked.mesh.setColor '#f00'
    null

  mouse_moved: (e) ->
    @mouse.x = e.x
    @mouse.y = e.y

  mouse_clicked: ->
    @mat or= 0
    @mat++
    if @mat % 2 == 1
      for obj in @world.getObjects()
        obj.mesh.material = "picking"
    else
      for obj in @world.getObjects()
        obj.mesh.material = "default"
    null

  index: ->
    @mouse = 
      x: -1
      y: -1

    @world.ambientColor = '#fff'
    @activeCamera.lookAt [4, 4, 4], [0, 0, 0], [0, 1, 0]
    
    @world.addLight new Jax.Light.Directional
      shadows: false
      direction: [-1, -1, -1]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
        radius: 0.5
      position: [-1, 0, -3]

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
        radius: 0.5
      position: [0, 0, -3]
