#= require "jax/core"
#= require "jax/camera"
#= require "jax/partition/octree"

###
A +Jax.World+ represents a scene in the graphics engine. All objects to be rendered (or at least,
all objects that you do not want to manually control!) should be added to the world. Each instance
of +Jax.Context+ has its own +Jax.World+, and the currently-active +Jax.World+ is delegated into
controllers and views as the +this.world+ property.
###
class Jax.World
  @include Jax.EventEmitter
  
  constructor: (@context) ->
    @renderOctree = false
    @lights = []
    @_objects = {}
    @ambientColor = new Jax.Color 0.05, 0.05, 0.05, 1
    @_objectsArray = []
    @_renderQueue = []
    @_sortPosition = vec3.create()
    @_cameras = []
    @cameras = 1
    # these numbers pulled from a hat.
    @octree = new Jax.Octree 20, 10
    @_octreeModel = new Jax.Model octree: @octree
    
    world = this
    @invalidateShadowMaps = ->
      obj = this # when event is fired, `this` becomes the object
      if obj.castShadow
        for light in world.lights
          continue unless light.shadowmap and light.isInRange obj
          light.shadowmap.invalidate()
      true
          
    @updateOctree = -> world.octree.update this
    
    # called to reorder transparencies
    # FIXME this is probably the slowest sorting algorithm in history.
    buf = vec3.create()
    @_queueSorter = (a, b) ->
      camPos = world._sortPosition
      len1 = vec3.length(vec3.subtract(buf, a.position, camPos)) - (a.mesh?.bounds.radius || 0)
      len2 = vec3.length(vec3.subtract(buf, b.position, camPos)) - (b.mesh?.bounds.radius || 0)
      len1 - len2
      
  @define 'ambientColor',
    get: -> @_ambientColor
    set: (c) ->
      (@_ambientColor or= new Jax.Color).parse c
      @trigger 'ambientChanged'
    
  @getter 'objects', ->
    console.log """The getter `objects` is deprecated; please use `getObjects()` instead.
    Note that the latter returns an array, where the former used to be a
    generic object."""
    console.log new Error().stack
    result = {}
    for obj in @getObjects()
      result[obj.__unique_id] = obj
    result
  
  @define 'cameras',
    get: -> @_cameras
    set: (i) ->
      if i < 1 then i = 1
      num = @_cameras.length
      @_cameras.length = i
      if i > num
        for j in [num...i]
          @_cameras[j] = new Jax.Camera
      @trigger 'numCamerasChanged'
  
  ###
  Renders this World to its Jax context. If a material (or its name) is not
  specified, the object will be rendered using the `"default"` material.
  
  If `cull` is `false`, the octree will not be culled and all objects within
  it will be rendered. This defaults to `true`.
  
  Returns the total number of objects rendered.
  ###
  render: (material, cull) ->
    if material
      # objects will look up their materials individually, but that wastes time.
      material = Jax.Material.find material unless material instanceof Jax.Material
    @renderOpaques(material, cull) + \
    @renderTransparencies(material)
    
  ###
  Renders the transparent objects in this scene. This is not meant to be
  called until after #renderOpaques, which simultaneously renders non-transparent
  objects and constructs the list of transparent ones.
  
  Returns the number of transparent objects rendered.
  ###
  renderTransparencies: (material) ->
    context = @context
    queue = @_renderQueue
    if queue.length
      ###
      FIXME the octree does yield nodes in order, but can't yet guarantee the
      order of the objects in the node. No big deal for opaques but we have to
      sort the transparencies because of this. Also, objects not in the octree
      are in no particular order.
      ###
      queue = queue.sort @_queueSorter
      queue.pop().render context, material while queue.length
    queue.length
    
  renderOrEnqueue: (material, models) ->
    context = @context
    queue = @_renderQueue
    
    num = 0
    for i, model of models
      if model.transparent or (model.mesh and model.mesh.transparent)
        queue.push model
      else
        model.render context, material
        num++
    num
    
  ###
  Renders the opaque objects in this scene and simultaneously builds up the list
  of transparent objects.
  
  Returns the number of opaque objects rendered.
  ###
  renderOpaques: (material, cull) ->
    numObjectsRendered = 0
    @_sortPosition[0] = @_sortPosition[1] = @_sortPosition[2] = 0
    vec3.transformMat4 @_sortPosition, @_sortPosition, @context.matrix_stack.getInverseModelViewMatrix()
    
    # render objects in octree
    if cull isnt false
      numObjectsRendered += @renderOpaquesInOctree material
    else
      numObjectsRendered += @renderOrEnqueue material, @octree.nestedObjects
      
    # render objects not in the octree
    numObjectsRendered + @renderOrEnqueue material, @_objects
  
  ###
  Renders the opaque objects in the octree, and adds any transparent objects it
  encounters within the tree to the World's render queue to be rendered last.
  Does not actually render transparent objects. Returns the number of objects
  rendered.
  ###
  renderOpaquesInOctree: (material) ->
    numObjectsRendered = 0
    context = @context
    frustum = context.activeCamera.frustum
    queue = @_renderQueue
    [renderOctree, octreeModel] = [@renderOctree, @octreeModel]
    @octree.traverse @_sortPosition, (node) =>
      size = node.size * 2
      switch frustum.cube node.position, size, size, size
        when Jax.Frustum.OUTSIDE
          # not visible, abort traversal
          return false
        when Jax.Frustum.INSIDE
          # completely visible, render all objects and abort traversal
          objectCount = node.nestedObjectCount
          objects = node.nestedObjects
          keepRecursing = false
        else
          # partially visible, render node's objects and recurse
          objectCount = node.objectCount
          objects = node.objects
          keepRecursing = true
      node.mesh.render context, octreeModel, material if renderOctree and objectCount
      numObjectsRendered += @renderOrEnqueue material, objects
      return keepRecursing
    numObjectsRendered
    
  ###
  Returns the framebuffer used for picking. See also #pickRegionalIndices.
  ###
  getPickBuffer: ->
    @pickBuffer or= new Jax.Framebuffer
      depth: true
      width: @context.canvas.width
      height: @context.canvas.height

  ###
  Adds the light to the world and then returns the light itself unchanged.
  Alternatively, you may specify options describing the light, which will
  be used to instantiate it internally and then return the new light source.
  ###
  addLight: (light) ->
    light = Jax.Light.find(light) unless light instanceof Jax.Light
    @lights.push light
    @trigger 'lightAdded', light
    light
    
  ###
  Removes the specified light from the world. The light is returned.
  ###
  removeLight: (light) ->
    @lights.splice @lights.indexOf(light)
    @trigger 'lightRemoved', light
    light

  ###
  Adds the model to the world and then returns the model itself unchanged.
  
  Options:
    * `addToOctree`: if `false`, the object will be added to a flat array
      which is iterated every frame. If `true`, the object will be added
      to an octree and culled from rendering if it is off-screen. Defaults
      to `true`.
  
  Note: the object itself may also define a `cull` property. If false, it
  acts the same as setting the `addToOctree` option to false. This also
  applies to the object's mesh, if any. Also note that if the object has
  no mesh, it will not be added to the octree.
  ###
  addObject: (object, options) ->
    addToOctree = (!options or                         \
                    options.addToOctree isnt false and \
                    options.cull isnt false            \
                  ) and                                \
                  object.cull isnt false and           \
                  object.mesh and                      \
                  object.mesh.cull isnt false
    
    if addToOctree
      @octree.add object
      object.on 'transformed', @updateOctree
      @trigger 'objectAddedToOctree'
    else
      @_objects[object.__unique_id] = object
    @getObjects().push object
    @trigger 'objectAdded'
    if object.castShadow isnt false
      # immediately invalidate shadow maps so that this object doesn't
      # not have a shadow
      @invalidateShadowMaps.call object
      object.on 'transformed', @invalidateShadowMaps
    object
  
  ###
  Returns the object with the specified object ID if it has been added to
  this World, or undefined if it has not.
  ###
  getObject: (id) ->
    return object if object = @_objects[id]
    for object in @getObjects()
      return object if object.__unique_id == id
    null
  
  ###
  If the model has not been added to this World, nothing happens. Otherwise,
  the object is removed from this World.
  
  The object itself is returned.
  ###
  removeObject: (obj) ->
    delete @_objects[obj.__unique_id]
    objectArray = @getObjects()
    objectArray.splice objectArray.indexOf(obj), 1
    # invalidate shadow maps if necessary so that the object's shadow gets
    # removed
    @invalidateShadowMaps.call obj
    obj.off 'transformed', @invalidateShadowMaps
    obj.off 'transformed', @updateOctree
    if node = @octree.find(obj)
      node.remove obj
      @trigger 'objectRemovedFromOctree'
    @trigger 'objectRemoved'
    obj
    
  pickDataBuffers = {}
  hashify = (a, b, c, d) ->
    "#{a.toFixed 6},#{b.toFixed 6},#{c.toFixed 6},#{d.toFixed 6}"

  ###
  Receives RGBA image data, which should have been encoded during a render-to-texture
  using the 'picking' material. Iterates through the image data and populates `array`
  with exactly one of each decoded ID encountered. Returns the array in which IDs are
  stored.
  ###
  parsePickData: (rgba, array) ->
    for i in [2...rgba.length] by 4
      if rgba[i] > 0 # blue key exists, we've found an object
        index = Jax.Util.decodePickingColor rgba[i-2], rgba[i-1], rgba[i], rgba[i+1]
        if index isnt undefined and array.indexOf(index) is -1
          array.push index
    array
  
  ###
  Picks all visible object IDs within the specified rectangular region and
  returns them as elements in an array.
  
  If an array is not specified, a new one is created. Otherwise, the array's
  contents are cleared.
  
  The array of objects is returned.
  ###
  pickRegionalIndices: (x1, y1, x2, y2, ary = []) ->
    # TODO remove the need for max's, min's, and flipping of Y
    [x, y] = [Math.min(x1, x2),     Math.min(y1, y2)    ]
    [w, h] = [Math.max(x1, x2) - x, Math.max(y1, y2) - y]
    ary.length = 0
    context = @context
    y = @context.canvas.height - (y + h)
    data = pickDataBuffers[hashify x, y, w, h] or= new Uint8Array(w*h*4)
    pickBuffer = @getPickBuffer()
    pickBuffer.bind context
    pickBuffer.viewport context
    context.gl.clear GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT
    context.gl.disable GL_BLEND
    @render "picking"
    context.gl.enable GL_BLEND
    context.gl.readPixels x, y, w, h, GL_RGBA, GL_UNSIGNED_BYTE, data
    data = data.data if data.data
    pickBuffer.unbind context
    context.viewport() # restore original viewport
    @parsePickData data, ary

  ###
  Picks all visible objects within the specified rectangular regions and returns them
  as elements in an array. The specified array is populated with objects that were
  picked; if omitted, a new array is created.
  ###
  pickRegion: (x1, y1, x2, y2, array = []) ->
    result = @pickRegionalIndices x1, y1, x2, y2, array
    for i in [0...result.length]
      result[i] = Jax.Model.__instances[result[i]]
    result

  singlePickArray = new Array(1)
  
  ###
  Picks the visible object at the specified pixel coordinates and returns its unique ID.
  If no object is visible at the given position, returns `undefined`.
  ###
  pickIndex: (x, y) -> @pickRegionalIndices(x, y, x+1, y+1, singlePickArray)[0]

  ###
  Picks the visible object at the specified pixel coordinates and returns the object.
  If no object is visible at the given position, returns `undefined`.
  ###
  pick: (x, y) -> @pickRegion(x, y, x+1, y+1, singlePickArray)[0]

  ###
  Returns the number of objects currently registered with this World.
  ###
  countObjects: -> @getObjects().length
  
  ###
  Returns an array of all of the objects that have been added to this World.
  Note that the returned array should not be altered in-place; duplicate it
  if you need to make changes to it.
  ###
  getObjects: -> @_objectsArray
  
  ###
  Updates each object in the world, passing the `timechange` argument into
  the objects' respective `update` functions (if they have one).
  ###
  update: (timechange) ->
    for object in @getObjects()
      object.update?(timechange)
    
  ###
  Disposes of this world by removing all references to its objects and
  disposing its light sources. Note that by default, objects within this 
  world will also be disposed. Pass `false` as an argument if you do not want
  the objects to be disposed.
  
  Note that both models and meshes _can_ be reused after disposal; they'll just
  be silently re-initialized. This means it is safe to dispose of models while
  they are still being used (although this is slower and not recommended if
  it can be avoided).
  ###
  dispose: (includeObjects = true) ->
    if includeObjects
      # dup the array to prevent iteration errors
      for obj in @getObjects().slice(0)
        @removeObject obj
        obj.dispose @context
    for light in @lights.splice(0)
      @removeLight light
      light.dispose @context
    @ambientColor = new Jax.Color 0.05, 0.05, 0.05, 1
    @trigger 'disposed'
    true
