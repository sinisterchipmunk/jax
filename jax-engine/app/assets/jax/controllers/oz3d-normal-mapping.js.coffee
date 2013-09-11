class OZ3DNormal extends Jax.Controller
  Jax.controllers.add @name, this

  update: (tc) ->
    @rot = (@rot or= 0) + tc
    @obj.camera.yaw tc * 0.1
  
  mouse_dragged: (m) ->
    pos = @light.position
    pos[0] += m.diffx * 0.1
    pos[2] += m.diffy * 0.1
    @light.position = pos
    @lighto.position = pos
    
  key_pressed: (e) ->
    @useSpecular = !@useSpecular
    @obj.mesh.material.findLayer(Jax.Material.Layer.NormalMap).specularChannel = @useSpecular
    
  index: ->
    @useSpecular = true
    console.log "Normal mapping test:"
    console.log "  Drag mouse to move light source."
    console.log ""
    console.log "  Normal map's alpha channel contains a specular map."
    console.log "  Specular map is enabled by default. Press any key to toggle."
    console.log "  When enabled, the mortar between bricks should have 0 specular."
    
    # @activeCamera.position = [0, 0, 100]
    @activeCamera.setPosition [32, -13.52, 55.4]
    @activeCamera.setDirection [-0.65, 0.2, -0.73]
    
    lightPos = [10, -10, 45]
    @light = @world.addLight new Jax.Light.Point
      shadows: false
      attenuation:
        constant: 1
        linear: 0
        quadratic: 0
      position: lightPos
      color:
        ambient:  [0.2, 0.2, 0.2, 1]
        diffuse:  [0.9, 0.9, 0.9, 1]
        specular: [0.9, 0.6, 0.6, 1]
    @lighto = @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
        slices: 6
        stacks: 6
        radius: 0.5
        material: new Jax.Material.Surface
          color: '#fff'
          intensity: 100
      position: lightPos
      
    material = new Jax.Material.Surface
      shininess: 20
      color:
        ambient: [0.6, 0.6, 0.6, 1]
        diffuse: [0.6, 0.6, 0.6, 1]
        specular:[1, 0.9, 0.9, 1]
      # textures:  [ {
      #   path: '/textures/oz3d_color_map.jpg'
      #   scale: 4
      # } ]
      normalMaps: [ {
        path: '/textures/oz3d_normal_and_specular_map.png'
        specularChannel: true
        scale: 4
      } ]
      
    @obj = model = @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
        material: material
        slices: 20
        stacks: 20
        radius: 40
      position: [0, 0, 0]
    model.camera.yaw Math.PI / 2
