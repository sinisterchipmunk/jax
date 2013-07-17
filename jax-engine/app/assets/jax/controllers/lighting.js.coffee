movement = { forward: 0, backward: 0, left: 0, right: 0 }

SQ2_2 = Math.sqrt(2) / 2
Jax.Controller.create "lighting",
  index: ->
    @world.addObject new Jax.Framerate
    @teapot = @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Teapot(size: 10)
      position: [0, 0, -25]
    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Quad(size: 75)
      position: [0, -15, -50]
      castShadow: false
      
    @spot = @world.addLight new Jax.Light.Spot
      shadows: true
      position: [0, 0, 30]
      direction: [0, 0, -1]
      attenuation:
        constant: 0
        linear: 0.04
        quadratic: 0
      innerSpotAngle: Math.PI / 4.375
      outerSpotAngle: Math.PI / 4
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 1, 1, 1]
        specular: [1, 1, 1, 1]
    @point = @world.addLight new Jax.Light.Point
      shadows: true
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 0, 0, 1]
        specular: [1, 0, 0, 1]
      position: [-20, 0, 0]
      direction: [20, 0, -25]
    @directional = @world.addLight new Jax.Light.Directional
      shadows: true
      direction: [-1, -1, -1]
      attenuation:
        constant: 1
        linear: 0
        quadratic: 0
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [0, 0, 1, 1]
        specular: [0, 0, 1, 1]
    
    @context.activeCamera.position = [0, 15, 50]
    @context.activeCamera.lookAt [0, 0, 0]
    
  mouse_dragged: (e) ->
    newPos = @teapot.camera.position
    newPos[0] += e.diffx * 0.1
    newPos[2] += e.diffy * 0.1
    @teapot.camera.position = newPos

  update: (timechange) ->
    return unless spot = @spot
    
    speed = Math.PI / 4
    rotationDirection = @rotationPerSecond || speed
    
    # see if it's time to reverse direction. A camera's view vector has magnitude 1.
    # When magnitude is 1, X is cos. The cos of 45 degrees is sqrt(2)/2. So to pivot every
    # 45 degrees off from the focal point (for a total of 90 degrees difference), we'll
    # check X <=> sqrt(2)/2.
    view = spot.direction
    if view[0] > SQ2_2 then @rotationPerSecond = speed
    else if view[0] < -SQ2_2 then @rotationPerSecond = -speed
    
    # rotate the spotlight. Just like any other object, a light has its own camera, so
    # it's trivial to orient it within the scene. Rotating about the Y axis causes a
    # horizontal movement.
    spot.rotate rotationDirection*timechange, 0, 1, 0
    
    # update player position if s/he's holding a movement key down
    # var speed = 25 * timechange;
    # 
    # this.activeCamera.move((movement.forward + movement.backward) * speed);
    # this.activeCamera.strafe((movement.left + movement.right) * speed);