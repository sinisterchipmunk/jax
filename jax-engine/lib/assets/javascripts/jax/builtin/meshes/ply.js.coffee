#= require_self
#= require_tree './ply'

class Jax.Mesh.PLY extends Jax.Mesh.Triangles
  ###
  Examples:
  
    new Jax.Mesh.PLY "/path/to/model.ply"
    new Jax.Mesh.PLY path: "/path/to/model.ply", method: "POST"
  ###
  constructor: (options = {}) ->
    if typeof options is 'string' then options = path: options
    @size = 1
    @method = "GET"
    super options
    unless @parser
      xhr = new XMLHttpRequest()
      # xhr.overrideMimeType "text/plain; charset=x-user-defined"
      xhr.responseType = "arraybuffer"
      xhr.onreadystatechange = =>
        if xhr.readyState is xhr.DONE
          if xhr.status is 200
            @parser = new Jax.Mesh.PLY.Parser xhr.response
            @rebuild()
          else throw new Error "Request for #{@path} returned status #{xhr.status}"
      xhr.open @method, @path
      xhr.send()
    
  init: (vertices, colors, textures, normals, indices) ->
    return unless @parser
    dist = vec3.create()
    max = 0
    for vertex in (@parser.vertex || @parser.vertices)
      vertices.push vertex.x, vertex.y, vertex.z
      [dist[0], dist[1], dist[2]] = [vertex.x, vertex.y, vertex.z]
      len = vec3.length dist
      max = len if max < len
      if vertex.nx isnt undefined
        normals.push vertex.nx, vertex.ny, vertex.nz
      # intensity is used for grayscale, if colors are omitted
      intensity = (if vertex.intensity is undefined then 1 else vertex.intensity)
      if vertex.red is undefined then [red, green, blue] = [1, 1, 1]
      else [red, green, blue] = [vertex.red, vertex.green, vertex.blue]
      colors.push red * intensity, green * intensity, blue * intensity, 1
      
    # Use max to scale the entire mesh into unit size, and then resize it
    # to @size
    for v in [0...vertices.length]
      vertices[v] = vertices[v] / max * @size
      
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
