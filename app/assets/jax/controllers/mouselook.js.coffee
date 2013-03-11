movement =
  forward: 0
  backward: 0
  left: 0
  right: 0

Jax.Controller.create "mouselook",
  index: ->
    @world.addLight new Jax.Light.Directional
      direction: [1, -0.1, -1]
      color:
        specular: '#fdd'
        diffuse: "#eed"
        ambient: "#999"

    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Plane
        fn: (x, z) -> Math.random() * 10
      direction: [0, 1, 0]
      position: [0, -9, 0]

  mouse_dragged: (evt) ->
    @activeCamera.rotate 1/100, -evt.diffy, -evt.diffx, 0

  key_pressed: (event) ->
    switch event.keyCode
      when KeyEvent.DOM_VK_W then movement.forward  =  1
      when KeyEvent.DOM_VK_S then movement.backward = -1
      when KeyEvent.DOM_VK_A then movement.left     = -1
      when KeyEvent.DOM_VK_D then movement.right    =  1
       
  key_released: (event) ->
    switch event.keyCode
      when KeyEvent.DOM_VK_W then movement.forward  = 0
      when KeyEvent.DOM_VK_S then movement.backward = 0
      when KeyEvent.DOM_VK_A then movement.left     = 0
      when KeyEvent.DOM_VK_D then movement.right    = 0

  update: (timechange) ->
    speed = 10 * timechange
     
    @activeCamera.move (movement.forward + movement.backward) * speed
    @activeCamera.strafe (movement.left + movement.right) * speed
