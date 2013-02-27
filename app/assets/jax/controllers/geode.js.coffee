# Demo of a Geodesic Sphere

Jax.Controller.create "geode",
  index: ->

    @sun = @world.addLight new Jax.Light.Point
      shadows: false
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

    @spot = @world.addLight new Jax.Light.Spot
      shadows: true
      position: [0, 0, 30]
      direction: [0, 0, -1]
      attenuation:
        constant: 0
        linear: 0.03
        quadratic: 0
      spotExponent: 1
      innerSpotAngle: Math.TAU / 17.5
      outerSpotAngle: Math.TAU / 16
      color:
        ambient: [0, 0, 0, 1]
        diffuse: [1, 1, 1, 1]
        specular: [1, 1, 1, 1]

    @stats = @world.addObject new Jax.Framerate # this is not showing anything but a black square

    @geodes = []
    for n in [0..5] by 1

      # Wired Geodes
      geode = @world.addObject new Jax.Model
        position: [-6+n*2.4, 0, 0]
        mesh: new Jax.Mesh.GeodesicSphere { material: new Jax.Material.Wire, complexity: n }
        update: (timechange) ->
          @camera.rotate timechange * (0.03 + 0.85 / Math.pow(2,@mesh.complexity+1) ), 1, 0.75, 0.5
      @geodes.push geode

      # Textured Geodes

      # Testing weird behavior

      # NOT OK : When Y position < 0, UVs are Y flipped
      # NO ! Bug happens RANDOMLY !?! Or every other refresh !? WAT ?
      # Note that is only the icosahedron, the subdivided geodes stay fine
      geode = @world.addObject new Jax.Model
        position: [-6+n*2.4, -2.4, 0]
        mesh: new Jax.Mesh.GeodesicSphere {
          complexity: n
          material: new Jax.Material.Surface({
            shininess: 10
            color:
              ambient: [0.6, 0.6, 0.6, 1]
              diffuse: [0.6, 0.6, 0.6, 1]
              specular:[1, 0.9, 0.9, 1]
            textures:  [{
               path: '/textures/icomars.jpg'
               min_filter: GL_NEAREST
               mag_filter: GL_NEAREST
               scale: 1
            }]
          })
        }
        update: (timechange) ->
          @camera.rotate timechange * (0.03 + 0.85 / Math.pow(2,@mesh.complexity+1) ), 1, 0.75, 0.5
      @geodes.push geode

      # OK
      geode = @world.addObject new Jax.Model
        position: [-6+n*2.4, 2.4, 0]
        mesh: new Jax.Mesh.GeodesicSphere {
          complexity: n
          material: new Jax.Material.Surface({
            shininess: 10
            color:
              ambient: [0.6, 0.6, 0.6, 1]
              diffuse: [0.6, 0.6, 0.6, 1]
              specular:[1, 0.9, 0.9, 1]
            textures:  [{
               path: '/textures/icomars.jpg'
               min_filter: GL_NEAREST
               mag_filter: GL_NEAREST
               scale: 1
            }]
          })
        }
        update: (timechange) ->
          @camera.rotate timechange * (0.03 + 0.85 / Math.pow(2,@mesh.complexity+1) ), 1, 0.75, 0.5
      @geodes.push geode

    @context.activeCamera.position = [0, 0, 14]
    @context.activeCamera.lookAt [0, 0, 0]



  mouse_dragged: (e) ->
    newPos = @context.activeCamera.position

    newPos[0] += e.diffx * -0.01
    if (e.base.ctrlKey)
      newPos[2] += e.diffy * 0.02
    else
      newPos[1] += e.diffy * 0.01

    @context.activeCamera.position = newPos


  update: (timechange) ->
    return unless sun = @sun

    @theta = @theta || 0
    @theta = (@theta + timechange) % Math.TAU

    sun.camera.position = [ Math.cos(@theta)*20, Math.sin(@theta)*20, Math.sin(@theta)*10 ]

    fps = @stats.fps
    $('#jax-banner').html("FPS : #{fps}")
