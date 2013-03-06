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

    @stats = @world.addObject new Jax.Framerate # this is not showing anything but a black square

    spherical2cartesianWithVector = (vSpherical) ->
      spherical2cartesian vSpherical[0],vSpherical[1],vSpherical[2]

    spherical2cartesian = (latitude, longitude, altitude) ->
      x = altitude * Math.sin( latitude ) * Math.cos( longitude )
      y = altitude * Math.sin( latitude ) * Math.sin( longitude )
      z = altitude * Math.cos( latitude )

      [x,y,z]

    cartesian2sphericalWithVector = (vCartesian) ->
      cartesian2spherical vCartesian[0], vCartesian[1], vCartesian[2]

    cartesian2spherical = (x, y, z) ->
      return [0,0,0] unless x != 0 || y != 0 || z != 0
      altitude = Math.sqrt x*x + y*y + z*z
      latitude  = Math.acos(z/altitude)
      longitude = Math.atan2(y,x)

      [latitude, longitude, altitude]


    cameraPosition = [0, 0, 10]
    @context.activeCamera.position = cameraPosition
    cameraTarget = [0, 0, 0]
    @context.activeCamera.lookAt cameraTarget
    @context.activeCamera._trackballTarget = cameraTarget
    @context.activeCamera._trackballCoords = cartesian2sphericalWithVector vec3.subtract(cameraPosition, cameraTarget, [])

    @context.activeCamera.computeFromTrackballCoords = () ->
      @position = vec3.add spherical2cartesianWithVector(@_trackballCoords), @_trackballTarget

    @context.activeCamera.setFixedYawAxis false

    @geodes = []

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
        @camera.rotate timechange * (0.23), 1, 0, 0



  # Trying trackball controls
  mouse_dragged: (e) ->

    cam = @context.activeCamera
    diffx = e.diffx
    diffy = e.diffy

    quatX = quat4.fromAngleAxis(-diffx * Math.TAU / 666, cam.up)
    quatY = quat4.fromAngleAxis(-diffy * Math.TAU / 666, cam.right)

    _quat = quat4.create()
    quat4.multiply(quatX, quatY, _quat)

    # warning : using cam.direction as third parameter here does not yield same (nor expected) result
    cam.direction = quat4.multiplyVec3 _quat, cam.direction, vec3.create()
    # warning : `cam.position =` is mandatory, or nothing will move
    cam.position = quat4.multiplyVec3 _quat, cam.position
    # these warns are a mix of @define and js voodoo. I'm all ears for a better usage suggestion !



  update: (timechange) ->
    return unless @sun1

    @theta = @theta || 0
    @theta = (@theta + timechange) % Math.TAU

    # sun's orbit
    distance = 18
    @sun1.camera.position = [ Math.cos(@theta)*distance, Math.sin(@theta)*distance, Math.sin(@theta)*10 ]
    @sun2.camera.position = [ Math.cos(@theta+Math.PI)*distance, Math.sin(@theta+Math.PI)*distance, Math.sin(@theta)*10 ]
    @sun3.camera.position = [ Math.cos(@theta)*distance, Math.sin(-@theta)*distance, Math.sin(-@theta)*10 ]
    @sun4.camera.position = [ Math.cos(@theta+Math.PI)*distance, Math.sin(Math.PI-@theta)*distance, Math.sin(@theta)*10 ]

    @sunHelper1.camera.position = @sun1.camera.position
    @sunHelper2.camera.position = @sun2.camera.position
    @sunHelper3.camera.position = @sun3.camera.position
    @sunHelper4.camera.position = @sun4.camera.position

    fps = @stats.fps
    $('#jax-banner').html("FPS : #{fps}")
