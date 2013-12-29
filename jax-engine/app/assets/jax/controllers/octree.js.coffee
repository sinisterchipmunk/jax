class Octree extends Jax.Controller
  Jax.controllers.add @name, this

  mouse_dragged: (e) ->
    @_cam.yaw 0.1 * e.diffx
    @_cam.frustum
    
  key_pressed: (e) ->
    if @_other
      @context.activeCamera = @_other
      @_other = null
    else
      @_other = @context.activeCamera
      @context.activeCamera = @_cam
    
  update: (tc) ->
    for id, obj of @octree.nestedObjects
      obj.rot += tc * 0.75
      pos = obj.camera.get 'position'
      pos[0] = Math.sin(obj.rot) * obj.radius
      pos[2] = Math.cos(obj.rot) * obj.radius
      obj.camera.setPosition pos
      @octree.update obj
    true

  index: ->
    @world.addObject new Jax.Framerate
    @world.ambientColor = "#333"
    @octree = octree = new Jax.Octree 1, -1
    
    rot = 0
    range = [-2..2]
    for x in range
      for y in range
        for z in [-1..1]
          rot += Math.TAU / 12.5
          radius = Math.sqrt(x*x+y*y) * 4
          pos = [Math.sin(rot) * radius, z * 2, Math.cos(rot) * radius]
          octree.add new Jax.Model
            rot: rot
            radius: radius
            position: pos
            mesh: new Jax.Mesh.Sphere
              radius: 0.25 + (Math.random() * 0.25 - 0.125)
              slices: 8
              stacks: 8
              color: [Math.abs(x) / 2, Math.abs(y) / 2, 1, 1]

    @_cam = camera = new Jax.Camera()
    camera.perspective
      near: 1
      far: 10
      width: @context.canvas.width
      height: @context.canvas.height
    camera.setPosition [0, 0, 4.5]
    @world.addObject camera.frustum
    @world.addLight new Jax.Light.Directional
      shadows: false
      color:
        ambient: "#333"
        diffuse: "#aaa"
        specular: "#fff"
      direction: [0, -1, -0.25]

    context = @context
    max = min = null
    numObjs = numNodes = 0
    renderContext = renderMaterial = null
    
    callback = (node) =>
      numNodes++
      size = node.size# * 2
      switch camera.frustum.cube(node.position, size, size, size)
        when Jax.Frustum.OUTSIDE
          # not visible, abort traversal
          return false
        when Jax.Frustum.INSIDE
          # wholly visible, render all objects in this and child nodes
          # and then abort traversal
          if node.nestedObjectCount
            node.mesh.render renderContext, model, renderMaterial
            for i, o of node.nestedObjects
              numObjs++
              o.render renderContext, renderMaterial
          return false
        else
          # partially visible, render immediate objects and check sub-nodes
          if (node.objectCount)
            node.mesh.render renderContext, model, renderMaterial
          for i, o of node.objects
            numObjs++
            o.render renderContext, renderMaterial
          return true
          
    @world.addObject model = new Jax.Model
      render: (context, material) ->
        renderContext = context
        renderMaterial = material
        numObjs = 0
        numNodes = 0
        octree.traverse camera.get('position'), callback

    @context.activeCamera.ortho
      near: 1
      far: 250
      left: -10
      right: 10
      top: 10
      bottom: -10
    @context.activeCamera.lookAt [0, 27, 0], [0, 0, 0], [0,0,-1]
