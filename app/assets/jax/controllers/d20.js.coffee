# Demo of a 20-sided dice
# Access demo by cloning and running jax repo in localhost

Jax.Controller.create "d20",
  index: ->

    @sun1 = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.0017
      color:
        ambient:  [0.8, 1, 0.8, 0.75]
        diffuse:  [1, 1, 0, 1]
        specular: [1, 0, 1, 1]
      position:  [-20, 0, 0]

    @sun2 = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient:  [0, 0, 0, 1]
        diffuse:  [1, 0, 1, 1]
        specular: [0, 1, 0, 1]
      position:  [20, 0, 0]

    @sun3 = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient:  [0, 0, 0, 1]
        diffuse:  [0, 1, 0, 1]
        specular: [1, 1, 0, 1]
      position:  [0, 20, 0]

    @sun4 = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient:  [0, 0, 0, 1]
        diffuse:  [0, 1, 1, 1]
        specular: [1, 1, 0, 1]
      position:  [0, -20, 0]

    @sunHelper1 = @world.addObject new Jax.Model
      position: @sun1.camera.position
      material: new Jax.Material.Surface
      mesh: new Jax.Mesh.Icosahedron
        size: 0.2
        color: @sun1.color.diffuse

    @sunHelper2 = @world.addObject new Jax.Model
      position: @sun2.camera.position
      mesh: new Jax.Mesh.Icosahedron
        size: 0.2
        color: @sun2.color.diffuse

    @sunHelper3 = @world.addObject new Jax.Model
      position: @sun3.camera.position
      mesh: new Jax.Mesh.Icosahedron
        size: 0.2
        color: @sun2.color.diffuse

    @sunHelper4 = @world.addObject new Jax.Model
      position: @sun4.camera.position
      mesh: new Jax.Mesh.Icosahedron
        size: 0.2
        color: @sun2.color.diffuse

    @stats = @world.addObject new Jax.Framerate


    # Trackball Camera
    cameraPosition = [0, 0, 10]
    @context.activeCamera.position = cameraPosition
    cameraTarget = [0, 0, 0]
    @context.activeCamera.lookAt cameraTarget
    @context.activeCamera.setFixedYawAxis false


    # Textured D20, added to world once texture is loaded (this is important, or random bug will eat your brainz !)
    world = @world
    geode = new Jax.Model
      position: [0, 0, 0]
      mesh: new Jax.Mesh.GeodesicSphere {
        subdivisions: 0
        material: new Jax.Material.Surface({
          shininess: 7
          color:
            ambient: [0.6, 0.6, 0.6, 1]
            diffuse: [0.6, 0.6, 0.6, 1]
            specular:[1, 0.9, 0.9, 1]
          textures:  [{
            path: '/textures/d20_plain_red.png'
          }]
          normalMaps: [{
            path: '/textures/d20_normal.png'
            onload: (img) ->
              world.addObject geode
            specularChannel: true
          }]
        })
      }
      update: (timechange) ->
        @camera.rotate timechange * (0.08), 1, 5, 0



  # Trying trackball controls
  mouse_dragged: (e) ->

    baseAngle = Math.TAU / 666

    cam = @context.activeCamera

    w = @context.canvas.width
    h = @context.canvas.height

    # x and y along centered orthogonal referential, right and up positive
    x = e.x - w / 2
    y = (e.y - h / 2) * -1
    diffx = e.diffx
    diffy = e.diffy

    r = Math.min(w, h) / 2

    # The mouse is in the inscribed circle of the canvas, let's rotate
    if (x*x + y*y < r*r)

      _quat = quat.create()
      quat.multiply(
        _quat, 
        quat.setAxisAngle(quat.create(), cam.up, -1 * diffx * baseAngle),
        quat.setAxisAngle(quat.create(), cam.right, -1 * diffy * baseAngle)
      )

      # warning : using cam.direction as third parameter here does not yield same (nor expected) result
      cam.direction = vec3.transformQuat vec3.create(), cam.direction, _quat
      # warning : `cam.position =` is mandatory, or nothing will move
      cam.position = vec3.transformQuat vec3.create(), cam.position, _quat
      # these warns are a mix of @define and js voodoo. I'm all ears for a better usage suggestion !

    else # let's roll !

      cam.roll -1 * ( Math.sign(y) * diffx + Math.sign(x) * diffy ) * baseAngle


  update: (timechange) ->
    return unless @sun1 && @sun2 && @sun3 && @sun4

    @theta = @theta || 0
    @theta = (@theta + timechange) % Math.TAU

    # sun's orbit
    distance = 18
    @sun1.camera.position = [ Math.cos(@theta)*distance, Math.sin(@theta)*distance, Math.sin(@theta)*10 ]
    @sun2.camera.position = [ Math.cos(@theta+Math.PI)*distance, Math.sin(@theta+Math.PI)*distance, Math.sin(@theta)*10 ]
    @sun3.camera.position = [ Math.cos(@theta)*distance, Math.sin(-@theta)*distance, Math.sin(-@theta)*10 ]
    @sun4.camera.position = [ Math.cos(@theta+Math.PI)*distance, Math.sin(Math.PI-@theta)*distance, Math.sin(-@theta)*10 ]

    @sunHelper1.camera.position = @sun1.camera.position
    @sunHelper2.camera.position = @sun2.camera.position
    @sunHelper3.camera.position = @sun3.camera.position
    @sunHelper4.camera.position = @sun4.camera.position



    ## Some Math Helpers
    # These have got to be be defined somewhere in Math
#    spherical2cartesianWithVector = (vSpherical) ->
#      spherical2cartesian vSpherical[0], vSpherical[1], vSpherical[2]
#
#    spherical2cartesian = (latitude, longitude, altitude) ->
#      x = altitude * Math.sin( latitude ) * Math.cos( longitude )
#      y = altitude * Math.sin( latitude ) * Math.sin( longitude )
#      z = altitude * Math.cos( latitude )
#
#      [x,y,z]
#
#    cartesian2sphericalWithVector = (vCartesian) ->
#      cartesian2spherical vCartesian[0], vCartesian[1], vCartesian[2]
#
#    cartesian2spherical = (x, y, z) ->
#      return [0,0,0] unless x != 0 || y != 0 || z != 0
#      altitude  = Math.sqrt x*x + y*y + z*z
#      longitude = Math.atan2 y, x
#      latitude  = Math.acos z/altitude
#
#      [latitude, longitude, altitude]