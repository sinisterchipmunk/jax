###
Constructs a 6-sided Cube mesh.

Options:

* width : the width of the cube in units. Defaults to +size+.
* height : the height of the cube in units. Defaults to +size+.
* depth : the depth of the cube in units. Defaults to +size+.
* size : a value to use for any of the other options if
  they are unspecified. Defaults to 1.0.

Example:

    new Jax.Mesh.Cube();                  //=> 1x1x1
    new Jax.Mesh.Cube({size:2});          //=> 2x2x2
    new Jax.Mesh.Cube({width:2});         //=> 2x1x1
    new Jax.Mesh.Cube({width:2,depth:3}); //=> 2x1x3
###
class Jax.Mesh.Cube extends Jax.Mesh.Triangles
  SIDES = ['front', 'back', 'left', 'right', 'top', 'bottom']
  _tmpvec3 = vec3.create()

  constructor: (options = {}) ->
    size = options.size or= 1
    options.width  or= options.size
    options.depth  or= options.size
    options.height or= options.size
    super options

    # TODO for performance, only update data that has actually changed
    invalidate = => @invalidate true
    [w, h, d] = [options.width, options.height, options.depth]
    @left = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @left.camera.reorient [-1, 0, 0], [-w/2, 0, 0]
    @left.mesh.on 'colorChanged', invalidate
    @left.camera.on 'updated', invalidate
    Object.defineProperty @left, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c

    @right = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @right.camera.reorient [1, 0, 0], [w/2, 0, 0]
    @right.mesh.on 'colorChanged', invalidate
    @right.camera.on 'updated', invalidate
    Object.defineProperty @right, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c

    @front = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @front.camera.reorient [0, 0, 1], [0, 0, d/2]
    @front.mesh.on 'colorChanged', invalidate
    @front.camera.on 'updated', invalidate
    Object.defineProperty @front, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c

    @back = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @back.camera.reorient [0, 0, -1], [0, 0, -d/2]
    @back.mesh.on 'colorChanged', invalidate
    @back.camera.on 'updated', invalidate
    Object.defineProperty @back, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c

    @top = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @top.camera.reorient [0, 1, 0], [0, h/2, 0]
    @top.mesh.on 'colorChanged', invalidate
    @top.camera.on 'updated', invalidate
    Object.defineProperty @top, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c

    @bottom = new Jax.Model mesh: new Jax.Mesh.Quad d, h
    @bottom.camera.reorient [0, -1, 0], [0, -h/2, 0]
    @bottom.mesh.on 'colorChanged', invalidate
    @bottom.camera.on 'updated', invalidate
    Object.defineProperty @bottom, 'color',
      get: -> @mesh.color
      set: (c) -> @mesh.color = c


  init: (verts, colors, texes, norms) ->
    # we need to get each quad's vertices, but then transform them by the
    # object's local transformation, which includes the position offset and
    # direction.

    for side in SIDES
      side = this[side]
      sdata = side.mesh.data
      # use inverse xform to go from world space to object space, instead of
      # the opposite.
      mvmatrix = side.camera.getTransformationMatrix()
      nmatrix = side.camera.getNormalMatrix()
      for j in [0...sdata.length]
        [vofs, tofs, cofs] = [j * 3, j * 2, j * 4]
        _tmpvec3[0] = sdata.vertexBuffer[vofs  ]
        _tmpvec3[1] = sdata.vertexBuffer[vofs+1]
        _tmpvec3[2] = sdata.vertexBuffer[vofs+2]
        vec3.transformMat4 _tmpvec3, _tmpvec3, mvmatrix
        verts.push -_tmpvec3[0], -_tmpvec3[1], -_tmpvec3[2]

        _tmpvec3[0] = sdata.normalBuffer[vofs  ]
        _tmpvec3[1] = sdata.normalBuffer[vofs+1]
        _tmpvec3[2] = sdata.normalBuffer[vofs+2]
        vec3.transformMat3 _tmpvec3, _tmpvec3, nmatrix
        norms.push _tmpvec3[0], _tmpvec3[1], _tmpvec3[2]

        for k in [0...4]
          colors.push sdata.colorBuffer[cofs+k]
          if k < 2
            texes.push sdata.textureCoordsBuffer[tofs+k]

    true # don't return an array, it's faster
