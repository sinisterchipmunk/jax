# Demo of a Geodesic Sphere
# Access demo by cloning and running jax repo in localhost
Jax.Controller.create "geodes",
  index: ->

    @sun = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 0
        linear: 0
        quadratic: 0.00175
      color:
        ambient:  [0, 0, 0, 1]
        diffuse:  [1, 0, 0, 1]
        specular: [1, 0, 0, 1]
      position:  [-20, 0, 0]
      direction: [20, 0, -25]

    @spot = @world.addLight new Jax.Light.Spot
      shadows: false
      position:  [-6, 3, 30]
      direction: [0, 0, -1]
      attenuation:
        constant: 0
        linear: 0.036
        quadratic: 0
      innerSpotAngle: Math.TAU / 8.725
      outerSpotAngle: Math.TAU / 8
      color:
        ambient:  [0, 0, 0, 1]
        diffuse:  [1, 1, 1, 1]
        specular: [1, 1, 1, 1]

    @stats = @world.addObject new Jax.Framerate

    @context.activeCamera.position = [0, 3, 13]
    @context.activeCamera.lookAt [0, 1.5, 0]


    # we need this as a closure, because of the onload
    createTexturedGeode = (n, world) ->
      geode = new Jax.Model
        _loaded: false
        position: [-3.5+n*2.4, -2.4, 0]
        mesh: new Jax.Mesh.GeodesicSphere {
          subdivisions: n
          material: new Jax.Material.Surface({
            shininess: 7
            color:
              ambient: [0.6, 0.6, 0.6, 1]
              diffuse: [0.6, 0.6, 0.6, 1]
              specular:[1, 0.9, 0.9, 1]
            textures:  [{
              path: '/textures/icosahedron/mars.jpg'
              onload: ()-> world.addObject geode
            }]
          })
        }
        update: (timechange) ->
          @camera.rotate timechange * (0.03 + 0.85 / Math.pow(2,@mesh.subdivisions+1) ), 1, 0.75, 0.5


    for n in [0..2] by 1

      # Pulsating Geodes Duals
      geode = @world.addObject new Jax.Model
        position: [-3.5+n*2.4, 4.8, 0]
        mesh: new Jax.Mesh.GeodesicSphereDual { material: new Jax.Material.Surface, subdivisions: n }
        update: (timechange) ->
          @camera.rotate timechange * -1 * (0.03 + 0.85 / Math.pow(2,@mesh.subdivisions+1) ), 1, 0.75, 0.5

          # pulsate
          @stellation = @stellation || 0 # not rly, but what else then ?
          buff = @mesh.data.vertexBuffer # look into using Mesh#vertices
          for i in [0...buff.length] by 9
            o = vec3.fromValues(buff[i],buff[i+1],buff[i+2])

            @stellation = (@stellation + timechange * (Math.TAU / 6180) ) % Math.TAU
            vec3.scale(o, vec3.normalize(o, o), @mesh.size * (Math.cos(@stellation)+1))

            buff[i  ] = o[0]
            buff[i+1] = o[1]
            buff[i+2] = o[2]
          @mesh.data.recalculateNormals()


      # Geodes Duals
      geode = @world.addObject new Jax.Model
        position: [-3.5+n*2.4, 2.4, 0]
        mesh: new Jax.Mesh.GeodesicSphereDual { material: new Jax.Material.Surface({
          textures:  [{
            path: '/textures/geode_dual/tron.png'
          }]
        }), subdivisions: n }
        update: (timechange) ->
          @camera.rotate timechange * (0.025 + 0.85 / Math.pow(2,@mesh.subdivisions+1) ), 1, 0.75, 0.5


      # Wired Geodes
      geode = @world.addObject new Jax.Model
        position: [-3.5+n*2.4, 0, 0]
        mesh: new Jax.Mesh.GeodesicSphere { material: new Jax.Material.Wire, subdivisions: n }
        update: (timechange) ->
          @camera.rotate timechange * (0.03 + 0.85 / Math.pow(2,@mesh.subdivisions+1) ), 1, 0.75, 0.5

      # Textured Geodes
      # Added to @world AFTER image onload, or uvmapping will RANDOMLY y-flip !
      world = @world
      createTexturedGeode(n, @world)

  # Drag to pan
  # Ctrl + drag Y-wise to zoom
  mouse_dragged: (e) ->
    newPos = @context.activeCamera.position

    newPos[0] += e.diffx * -0.01
    if (e.base.ctrlKey)
      newPos[2] += e.diffy * 0.02
    else
      newPos[1] += e.diffy * 0.01

    @context.activeCamera.position = newPos


  update: (timechange) ->
    return unless @sun

    @theta = @theta || 0
    @theta = (@theta + timechange/3) % Math.TAU

    # sun's orbit
    @sun.camera.position = [ Math.cos(@theta)*20, Math.sin(@theta)*20, Math.sin(@theta)*10 ]
