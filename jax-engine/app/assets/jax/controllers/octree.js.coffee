Jax.Controller.create "octree",
  mouse_dragged: (e) ->
    # x = @o.position
    # x[0] += e.diffx * 0.1
    # x[1] += e.diffy * 0.1
    # @o.position = x
    # @octree.update @o
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
      pos = obj.position
      pos[0] = Math.sin(obj.rot) * obj.radius
      pos[2] = Math.cos(obj.rot) * obj.radius
      obj.camera.position = pos
      @octree.update obj
    true

  index: ->
    # @world.addObject new Jax.Framerate
    # 
    # @world.ambientColor = [1,1,1,1]
    # @octree = octree = new Jax.Octree 1, 1
    # 
    # @world.addLight new Jax.Light.Directional
    #   shadows: false
    # 
    # octree.add new Jax.Model position: [-0.5, -0.5,-0.5], mesh: new Jax.Mesh.Sphere(radius: 0.5)
    # octree.add @o = new Jax.Model position: [ 0.8,  0.8, 0.8], mesh: new Jax.Mesh.Sphere(radius: 0.1)
    # @context.activeCamera.position = [0, 0, 5]
    # 
    # @world.addObject new Jax.Model
    #   render: (context, material) ->
    #     numObjs = 0
    #     numNodes = 0
    #     octree.traverse [0, 0, 5], (node) =>
    #       numNodes++
    #       size = node.size
    #       if node.nestedObjectCount
    #         node.mesh.render context, this, material
    #       for i, o of node.objects
    #         numObjs++
    #         o.render context, material
    #       return true    
    # 
    # return
    
    @world.addObject new Jax.Framerate
    @world.ambientColor = [1,1,1,1]
    @octree = octree = new Jax.Octree 1, -1
    
    rot = 0
    range = [-2..2]
    for x in range
      for y in range
        for z in [-1..1]
          rot += Math.PI * 2 / 12.5
          radius = Math.sqrt(x*x+y*y) * 4
          pos = [Math.sin(rot) * radius, z * 2, Math.cos(rot) * radius]
          octree.add new Jax.Model
            rot: rot
            radius: radius
            position: pos
            mesh: new Jax.Mesh.Sphere(radius: 0.25 + (Math.random() * 0.25 - 0.125), slices: 8, stacks: 8, color: [Math.abs(x) / 2, Math.abs(y) / 2, 1, 1])

    @world.addObject new Jax.Model
      position: [ 0, 0, 4.5]
      mesh: new Jax.Mesh.Cube(size: 0.25, color: '#fff')
    
    @_cam = camera = new Jax.Camera()
    camera.perspective near: 1, far: 10, width: @context.canvas.width, height: @context.canvas.height
    camera.position = [0, 0, 4.5]
    @world.addObject camera.frustum
    # @world.addLight new Jax.Light.Directional
    #   shadows: false
    #   direction: [0, -1, -0.25]

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
        # when Jax.Frustum.INSIDE
        #   # wholly visible, render all objects in this and child nodes
        #   # and then abort traversal
        #   if node.nestedObjectCount
        #     node.mesh.render renderContext, this, renderMaterial
        #   for i, o of node.nestedObjects
        #     numObjs++
        #     o.render renderContext, renderMaterial
        #   return false
        else
          # partially visible, render immediate objects and check sub-nodes
          if (node.objectCount)
            node.mesh.render renderContext, this, renderMaterial
          for i, o of node.objects
            numObjs++
            o.render renderContext, renderMaterial
          return true
          
    @world.addObject new Jax.Model
      render: (context, material) ->
        renderContext = context
        renderMaterial = material
        numObjs = 0
        numNodes = 0
        octree.traverse camera.position, callback
        if min is null or min > numObjs then min = numObjs
        if max is null or max < numObjs then max = numObjs
        $('#jax-banner').html("Objects rendered: #{numObjs}; nodes traversed: #{numNodes}; records: [#{min}, #{max}]")
          
    # octree.add @world.addObject new Jax.Model position: [5, 5, 5], mesh: new Jax.Mesh.Cube(color: '#f00')

    @context.activeCamera.ortho near: 1, far: 250, left: -10, right: 10, top: 10, bottom: -10
    @context.activeCamera.lookAt [0, 0, 0], [0, 27, 0]
