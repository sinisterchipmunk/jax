###
An octree that is completely dynamic. It expands to fit the size of the scene and merges
nodes with too few objects. It will subdivide itself as many times as needed to contain
all of the objects in the scene.

It takes two parameters: split threshold and merge threshold.

If the number of objects added to a node is equal to or greater than the split threshold,
the octree subdivides itself and the objects added to it are delegated into its children.

If the total number of objects in a node (including its children and grandchildren) drops
below the merge threshold, then that node is un-subdivided, and all of the objects in
that node, its children and its grandchildren are removed into the node itself.

The octree exposes a few useful properties:

  * `objects`: a hash containing all of the objects _in this node_. This does not contain
    any objects belonging to any of the octree's children.
  * `nestedObjects`: a hash containing all of the objects in this node and all of its
    children, combined. This allows you to stop recursing and immediately process all
    objects at and below a particular level of subdivision, yielding a notable performance
    boost.
  * `objectCount`: the number of objects contained in this node, not counting its children.
  * `nestedObjectCount`: the number of objects contained in this node and all of its
    children, combined.
  * `position`: the position of a particular node in the octree. The root node is always
    at the origin `[0,0,0]`.
  * `size`: half of the total size of the octree (or of a particular node). The octree's
    total dimensions are `[(position - size) .. (position + size)]`.
  * `mesh`: useful for debugging purposes, each octree exposes an instance of `Jax.Mesh`.
    Rendering the mesh does not render the entire octree, only the specific node
    whose mesh was requested.
  
Objects are positioned in the octree according to their position in world space. The size
of the object doesn't have an effect on its location, only its depth in the octree. If an
object has no mesh or its mesh has no vertices, the size defaults to 0.1 to prevent
recursion errors.
###
class Jax.Octree
  SCALE = 1.1
  
  constructor: (@splitThreshold = 2, @mergeThreshold = 1, @depth = 0, @size = 1, @parent) ->
    @_isParent = false
    @_isSubdivided = false
    @children = []
    @objectCount = 0
    @nestedObjectCount = 0
    @objects = {}
    @nestedObjects = {}
    @position = vec3.create()
    
  @getter 'mesh', ->
    @_mesh or= new Jax.Mesh.LineCube @size * SCALE, @position
    
  ###
  Returns true if this octree contains other octrees, which is the case if
  any child of this octree has been instantiated, regardless of whether it
  is currently subdivided. If an octree returns true for both `isSubdivided`
  and `isParent`, then it has children that are currently in use. If it returns
  true for `isParent` but not `isSubdivided`, then it has children that were
  once in use, but currently are not. If it returns true for `isSubdivided`
  but not `isParent`, then it is expected to have children soon, but they
  have not yet been instantiated.
  ###
  isParent: -> @_isParent
  
  ###
  Returns true if this octree has been subdivided. This indicates whether
  the octree is expected to contain other octrees, not whether it currently
  does so. An octree that is subdivided may or may not be a parent, because
  it may have been subdivided but its children may not yet have been
  instantiated. If an octree returns true for both `isSubdivided` and
  `isParent`, then it has children that are currently in use. If it returns
  true for `isParent` but not `isSubdivided`, then it has children that were
  once in use, but currently are not. If it returns true for `isSubdivided`
  but not `isParent`, then it is expected to have children soon, but they
  have not yet been instantiated.
  ###
  isSubdivided: -> @_isSubdivided

  ###
  Doubles the size of this octree. If it is not a parent, it is subdivided.
  If it is a parent, then each of its nodes will also double in size; the
  leaf nodes be subdivided and become parents.
  ###
  enlarge: ->
    @size *= 2
    for child in @children
      if child
        @recalculateChildPosition child
        child.enlarge()
        child.reEvaluateObjects()

    @subdivide()
    @reEvaluateObjects()
    @_mesh = null
    
  ###
  Subdivides this octree, but does not actually instantiate any of its
  chidlren.
  ###
  subdivide: ->
    # console.log "subdividing #{@depth}"
    @_isSubdivided = true
  
  chvec = vec3.create()
  
  ###
  Returns the child in the appropriate quadrant for the given vector, which
  represents a position in world space. If the child has not yet been instantiated,
  it is instantiated and this octree becomes a parent. Otherwise, the current
  instance is returned.
  ###
  getChildInQuadrant: (vec) ->
    if child = @children[@quadrant vec, chvec]
      child
    else
      child = new Jax.Octree @splitThreshold, @mergeThreshold, @depth + 1, @size * 0.5, this
      vec3.scale chvec, @size * 0.5
      vec3.add chvec, @position, child.position
      @children[@quadrant vec] = child
      
  ###
  Given a child node, recalculates its position based on the size and position
  of this node.
  ###
  recalculateChildPosition: (child) ->
    @quadrant child.position, chvec
    vec3.scale chvec, @size * 0.5
    vec3.add chvec, @position, child.position
  
  ###
  Returns true if this octree can contain the specified object based on its
  current position and size.
  ###
  canContain: (obj) ->
    objPos  = obj.position
    objSize = 0
    octPos  = @position
    octSize = @size * SCALE
    return false if (obj.mesh?.bounds.radius || 0.1) > octSize
    result = true
    if objPos[0] + objSize > octPos[0] + octSize then return false
    if objPos[0] - objSize < octPos[0] - octSize then return false
    if objPos[1] + objSize > octPos[1] + octSize then return false
    if objPos[1] - objSize < octPos[1] - octSize then return false
    if objPos[2] + objSize > octPos[2] + octSize then return false
    if objPos[2] - objSize < octPos[2] - octSize then return false
    return true
    
  ###
  Adds the object to `nestedObjects` and increments `nestedObjectCount`. This
  represents the union of all objects in either this octree or one of its
  children.
  
  If this octree has a parent, it is instructed to track the object as well.
  
  Returns the object.
  ###
  trackNestedObject: (obj) ->
    # console.log "tracking #{obj.__unique_id} at #{@depth}"
    unless @nestedObjects[obj.__unique_id]
      @nestedObjects[obj.__unique_id] = obj
      @nestedObjectCount++
    @parent.trackNestedObject obj if @parent
    obj
    
  ###
  Removes the object from @nestedObjects, and then instructs this node's
  parent, if any, to do the same. Children are not affected. Returns
  the object. This method triggers merging via `#merge` if the number of
  nested objects meets the @mergeThreshold.
  ###
  untrackNestedObject: (obj) ->
    # console.log "untracking #{obj.__unique_id} at #{@depth}"
    if @nestedObjects[obj.__unique_id]
      delete @nestedObjects[obj.__unique_id]
      @nestedObjectCount--
      @merge() if @nestedObjectCount <= @mergeThreshold
    @parent.untrackNestedObject obj if @parent
    obj
  
  ###
  Adds the object to this octree (not any of its children). This method
  triggers splitting via `#split` if the number of objects meets the
  @splitThreshold.
  ###
  addToSelf: (obj) ->
    # console.log "addToSelf[#{@depth}] #{obj.__unique_id}"
    unless @objects[obj.__unique_id]
      @objects[obj.__unique_id] = obj
      @objectCount++
      if @objectCount >= @splitThreshold
        @split()
    @trackNestedObject obj
  
  ###
  Adds the object to the appropriate node (this octree, one of its
  children, or this octree's parent, if any) based on its size and
  position. If the object is too large, and this octree doesn't have
  a parent to add it to, this octree and all of its children will
  be enlarged to fit the object.
  ###
  add: (obj) ->
    if not @hasBeenMerged() and @canContain(obj)
      if @isSubdivided()
        @addToChild(obj) || @addToSelf(obj)
      else
        @addToSelf obj
    else
      if @parent
        @parent.add obj
      else
        @enlarge()
        @add obj
        
  ###
  Returns true if this node has been merged into its parent, false
  otherwise.
  ###
  hasBeenMerged: ->
    return @parent && !@parent.isSubdivided()
  
  ###
  Removes the object from the octree, potentially triggering a merge.
  ###
  remove: (obj) ->
    # console.log "removing #{obj.__unique_id} from #{@depth}"
    if @objects[obj.__unique_id]
      delete @objects[obj.__unique_id]
      @objectCount--
    @untrackNestedObject obj
    
  ###
  Causes this octree to subdivide itself if it has no children, and then
  redistribute its objects to its children if they fit. If the objects
  are too large to be distributed to children, they will remain in this
  octree.
  ###  
  split: ->
    # console.log "splitting #{@depth}"
    @subdivide()
    for id, obj of @objects
      @addToChild obj
    true
    
  ###
  Re-checks all objects in this node to make sure they don't belong in
  a child node. This method will not trigger a split or a merge on the
  current node, but the act of moving objects to child nodes may do so.
  ###
  reEvaluateObjects: ->
    # console.log "re-evaluating #{@depth}"
    if @isSubdivided()
      for i, obj of @objects
        @addToChild obj
    true
    
  ###
  Merges all of the children in this octree by moving their objects into
  this node and then un-subdividing this node.
  ###
  merge: ->
    # console.log "merging #{@depth}"
    @_isSubdivided = false
    for child in @children
      child?.clear()
    
    @objectCount = @nestedObjectCount
    for id, obj of @nestedObjects
      @objects[id] = obj
    true
    
  ###
  Recursively clears this octree, removing everything in it and its children,
  and then un-subdivides itself.
  ###
  clear: ->
    # console.log "clearing #{@depth}, which has #{@nestedObjectCount} / #{@objectCount}"
    for id, obj of @nestedObjects
      delete @nestedObjects[id]
    for id, obj of @objects
      delete @objects[id]
    for child in @children
      child?.clear()
    @_isSubdivided = false
    @objectCount = @nestedObjectCount = 0

  ###
  Attempts to add obj to one of the children of this node, returning
  false if no suitable child could be found.
  ###
  addToChild: (obj) ->
    child = @getChildInQuadrant obj.position
    # console.log "addToChild[#{child.depth}] #{obj.__unique_id}"
    if child.canContain obj
      # console.log "Child can contain, moving"
      if @objects[obj.__unique_id]
        delete @objects[obj.__unique_id]
        @objectCount--
      @_isParent = true
      child.add obj
      @trackNestedObject obj
      true
    else
      false
  
  ###
  Returns the quadrant index (from 0 through 7) for the specified
  position, which is a `vec3` in world space. If `dest` is supplied,
  it should be a `vec3` and is populated with `[-1|1, -1|1, -1|1]`,
  a (non-normalized) directional vector from the position
  of this node toward the specified position.
  
  The returned index can be used to access the `#children` in this
  node, but they are not guaranteed to have been instantiated yet.
  Use `#getChildInQuadrant` to ensure that the sub-node has been
  instantiated.
  ###
  quadrant: (pos, dest) ->
    position = @position
    quadrant = 0
    if pos[0] > position[0] then quadrant |= 1
    if pos[1] > position[1] then quadrant |= 2
    if pos[2] > position[2] then quadrant |= 4
    
    if dest
      dest[0] = (if quadrant & 1 then 1 else -1)
      dest[1] = (if quadrant & 2 then 1 else -1)
      dest[2] = (if quadrant & 4 then 1 else -1)
      
    quadrant
    
  ###
  Finds and returns the node containing obj, or returns null if it can't
  be found.
  ###
  find: (obj) ->
    return this if @objects[obj.__unique_id]
    for child in @children
      if result = child?.find obj
        return result
    return null
    
  update: (obj) ->
    node = @find obj
    unless node.canContain obj
      node.remove obj
      (node.parent || node).add obj
    else
      node.reEvaluateObjects()
      
  ###
  Traverses this octree and its children, calling the callback method at each
  node. If the callback method returns `false` for any node, that node's children
  will not be traversed. If it returns any other value, `traverse` will recurse
  into the node's children.
  
  Nodes with an @nestedObjectCount equal to 0 are not processed.

  Nodes are always yielded in front-to-back order relative to the specified
  position, which must be a `vec3`.
  ###
  traverse: (pos, callback) ->
    return if @nestedObjectCount is 0
    return if callback(this) is false

    # So after some benchmarking, recursive traversal is actually faster than
    # queue-based traversal in both FF and Chrome. Who knew?
    if @isSubdivided()
      first = @quadrant pos
      @children[first  ]?.traverse pos, callback
      @children[first^1]?.traverse pos, callback
      @children[first^2]?.traverse pos, callback
      @children[first^4]?.traverse pos, callback
      @children[first^3]?.traverse pos, callback
      @children[first^5]?.traverse pos, callback
      @children[first^6]?.traverse pos, callback
      @children[first^7]?.traverse pos, callback
    true
