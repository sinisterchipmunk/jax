#= require_self
#= require_tree './ply'

class Jax.Mesh.PLY extends Jax.Mesh.Triangles
  constructor: (options) ->
    @path = options?.path
    @method = options?.method || "GET"
    delete options.path if options?.path
    delete options.method if options?.method
    super options
  
    xhr = new XMLHttpRequest()
    self = this
    # xhr.overrideMimeType "text/plain; charset=x-user-defined"
    xhr.responseType = "arraybuffer"
    xhr.onreadystatechange = ->
      if xhr.readyState is xhr.DONE
        if xhr.status is 200
          self.parser = new Jax.Mesh.PLY.Parser xhr.response# || xhr.responseText
          self.rebuild()
        else throw new Error "Request for #{self.path} returned status #{xhr.status}"
    xhr.open @method, @path
    xhr.send()
    
  init: (vertices, colors, textures, normals, indices) ->
    for vertex in (@parser.vertex || @parser.vertices)
      vertices.push vertex.x, vertex.y, vertex.z
      normals.push vertex.nx, vertex.ny, vertex.nz unless vertex.nx is undefined
      # intensity is used for grayscale, if colors are omitted
      intensity = (if vertex.intensity is undefined then 1 else vertex.intensity)
      if vertex.red is undefined then [red, green, blue] = [1, 1, 1]
      else [red, green, blue] = [vertex.red, vertex.green, vertex.blue]
      colors.push vertex.red * intensity, vertex.green * intensity, vertex.blue * intensity, 1
      
    for face in @parser.face
      for index in (face.vertex_index || face.vertex_indices)
        indices.push index
        # if face has an intensity, multiply it against the vertex color.
        # Don't have a better idea other than ignoring it...
        if (intensity = face.intensity) isnt undefined
          colors[index*4+0] *= intensity
          colors[index*4+1] *= intensity
          colors[index*4+2] *= intensity
          colors[index*4+3] *= intensity
    null
  
  render: (args...) ->
    return unless @parser
    super args...
