###
A simple square or rectangle. You can adjust its width and height, and that's about it.

This mesh is generally used for testing purposes, or for simple, textured objects like smoke particles.

Options:

* width : the width of this quad in units along the X axis. Defaults to +size+.
* height : the height of this quad in units along the Y axis. Defaults to +size+.
* size : a value to use for both width and height. Defaults to 1.0.

Examples:

    var quad = new Jax.Mesh.Quad({width: 2, height: 1});
    var quad = new Jax.Mesh.Quad({size:1.5});
###
class Jax.Mesh.Quad extends Jax.Mesh.Triangles
  constructor: (options) ->
    if typeof options is "number" then options = size: options
    options or= {}
    options.width or= options.size || 1
    options.height or= options.size || 1
    super options
  
  @define 'width',
    get: -> @_width
    set: (w) -> @_width = w; @invalidate()
  
  @define 'height',
    get: -> @_height
    set: (h) -> @_height = h; @invalidate()
    
  init: (verts, colors, textureCoords, normals, indices) ->
    width = @_width / 2
    height = @_height / 2
    
    verts.push -width,  height, 0
    verts.push -width, -height, 0
    verts.push  width,  height, 0
    verts.push  width,  height, 0
    verts.push -width, -height, 0
    verts.push  width, -height, 0

    textureCoords.push 0, 1
    textureCoords.push 0, 0
    textureCoords.push 1, 1
    textureCoords.push 1, 1
    textureCoords.push 0, 0
    textureCoords.push 1, 0
    
    normals.push 0, 0, 1
    normals.push 0, 0, 1
    normals.push 0, 0, 1
    normals.push 0, 0, 1
    normals.push 0, 0, 1
    normals.push 0, 0, 1
