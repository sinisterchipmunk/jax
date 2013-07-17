#= require_self
#= require_tree './obj'

class Jax.Mesh.OBJ extends Jax.Mesh.Triangles
  constructor: (pathOrOpts = {}) ->
    @size = 1
    @method = 'GET'
    if typeof(pathOrOpts) is 'string' then pathOrOpts = path: pathOrOpts
    super pathOrOpts
    unless @parser
      xhr = new XMLHttpRequest()
      xhr.onreadystatechange = =>
        if xhr.readyState is xhr.DONE
          if xhr.status is 200
            @parser = new Jax.Mesh.OBJ.Parser xhr.responseText
            @rebuild()
          else throw new Error "Request for #{@path} returned status #{xhr.status}"
      xhr.open @method, @path
      xhr.send()

  init: (vertices, colors, textures, normals, indices) ->
    return unless @parser
    dist = vec3.create()
    max = 0
    # TODO split these into sub-meshes so they can be given different
    # materials
    for name, obj of @parser.objects
      for face in obj.faces
        for v, i in face.v
          vertices.push v...
          textures.push face.t[i]...
          normals.push face.n[i]...
          vec3.copy dist, v
          len = vec3.length dist
          max = len if max < len

    # Use max to scale the entire mesh into unit size, and then resize it
    # to @size
    for v in [0...vertices.length]
      vertices[v] = vertices[v] / max * @size
    null
