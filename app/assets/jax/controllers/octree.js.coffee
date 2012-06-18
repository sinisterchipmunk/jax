Jax.Controller.create "octree",
  mouse_dragged: (e) ->
    @_cam.yaw 0.1 * e.diffx
    @_cam.getFrustum()
    
  key_pressed: (e) ->
    if @_other
      @context.player.camera = @_other
      @_other = null
    else
      @_other = @context.player.camera
      @context.player.camera = @_cam
    
  update: (tc) ->
    for id, obj of @octree.nestedObjects
      obj.rot += tc * 0.75
      pos = obj.position
      pos[0] = Math.sin(obj.rot) * obj.radius
      pos[2] = Math.cos(obj.rot) * obj.radius
      obj.camera.setPosition pos
      @octree.update obj
    true

  index: ->
    @world.addObject new Jax.Framerate
    
    @world.ambientColor = [1,1,1,1]
    @octree = octree = new Jax.Octree 2, 1
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
            mesh: new Jax.Mesh.Cube(color: [Math.abs(x) / 2, Math.abs(y) / 2, 1, 1])

    @world.addObject new Jax.Model position: [ 0, 0, 5], mesh: new Jax.Mesh.Cube(size: 0.25, color: '#fff')
    
    @_cam = camera = new Jax.Camera()
    camera.perspective near: 1, far: 50, width: @context.canvas.width, height: @context.canvas.height
    camera.setPosition [0, 0, 5]
    @world.addObject camera.getFrustum().getRenderable()

    context = @context
    max = min = null
    @world.addObject new Jax.Model
      render: (context, material) ->
        numObjs = 0
        numNodes = 0
        octree.traverse camera.getPosition(), (node) =>
          numNodes++
          size = node.size * 2
          node.mesh.render context, this, material
          
          switch camera.getFrustum().cube(node.position, size, size, size)
            when Jax.Scene.Frustum.OUTSIDE
              # not visible, abort traversal
              return false
            when Jax.Scene.Frustum.INTERSECT
              # partially visible, render immediate objects and check sub-nodes
              for i, o of node.objects
                numObjs++
                o.render context, material
              return true
            else
              # wholly visible, render all objects in this and child nodes
              # and then abort traversal
              for i, o of node.nestedObjects
                numObjs++
                o.render context, material
              return false
        if min is null or min > numObjs then min = numObjs
        if max is null or max < numObjs then max = numObjs
        $('#jax-banner').html("Objects rendered: #{numObjs}; nodes traversed: #{numNodes}; records: [#{min}, #{max}]")
          
    # octree.add @world.addObject new Jax.Model position: [5, 5, 5], mesh: new Jax.Mesh.Cube(color: '#f00')

    # @player.camera.ortho near: 1, far: 250, left: -10, right: 10, top: 10, bottom: -10
    @player.camera.lookAt [0, 0, 0], [0, 27, 0]
