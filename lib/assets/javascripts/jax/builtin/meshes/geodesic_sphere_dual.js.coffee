Jax.SubMesh = Jax.SubMesh || {}

###

An attempt at refactorization of submesh editing

tothink
* extend Jax.SubMesh.Base ?
* topmost level : use or extend Jax.Geometry.Pentagon and pipe here to vertexBuffer ?
* methods should work gracefully with slightly imperfect polygons. With all, in fact.
* need to be ultra light, opt-in
* is a full 5 trianglefan with no overlap
* should we parameterize a @pointer to vertexBuffer ? It's only a pointer, yet... +2 for git branch Benchmark
* look harder at trianglefan (which incidentally is in webgl)



###
class Jax.SubMesh.Pentagon

  # this will be moved to common parent of pentagon and hexagon submeshes
  _trianglesCount: 5 # pentagon has 5 triangles

  #
  constructor: (vertexBufferIndex) ->
    @vertexBufferIndex = vertexBufferIndex || 0

  setVertexBufferIndex: (vertexBufferIndex) ->
    @vertexBufferIndex = vertexBufferIndex


  # pentagon referential, height along normal
  addToCenterHeight: (height, vertexBuffer) ->
    for i in [0...@_trianglesCount] by 1
      j = @vertexBufferIndex + i * 9
      vertexBuffer[i] = vertexBuffer[i]
  # nah

  # normal vector of the nth triangle
  getTriangleNormal: (nth, vertexBuffer) ->
    j = @vertexBufferIndex + nth * 9
    vA = vec3.createFrom vertexBuffer[j  ],vertexBuffer[j+1],vertexBuffer[j+2]
    vB = vec3.createFrom vertexBuffer[j+3],vertexBuffer[j+4],vertexBuffer[j+5]
    vC = vec3.createFrom vertexBuffer[j+6],vertexBuffer[j+7],vertexBuffer[j+8]
    vAB = vec3.subtract vB, vA, []
    vAC = vec3.subtract vC, vA, []

    vec3.normalize( vec3.cross vAB, vAC, [] )


  # median normal of the faces
  getNormal: (vertexBuffer) ->
    normal = [0,0,0]
    for i in [0...@_trianglesCount] by 1
      vec3.add(normal, @getTriangleNormal(i, vertexBuffer))

    vec3.normalize(normal)


class Jax.SubMesh.Hexagon

  constructor: (vertexBufferIndex) ->
    @vertexBufferIndex = vertexBufferIndex || 0

  setVertexBufferIndex: (vertexBufferIndex) ->
    @vertexBufferIndex = vertexBufferIndex

  # tothink



###
A Geodesic Sphere Dual mesh
Its faces are 12 pentagons and the rest are hexagons.
Of course, these are made of respectively 5 and 6 triangles,
almost equilaterals.

With 0 subdivisions, it's a dodecahedron (12 pentagons, 0 hexagon)
With 1, it looks like a football
With 2, it looks like a golfball
With 3 and more, it looks like a Civilization V map

Don't use it with more than 3 subdivisions

¡ THIS SCALES BADLY ! O(4^n) at least

Options:

* size : the size of the geode in units. Defaults to 1.0.
* subdivisions : the number of times each face is divided into 4 triangles before dualization. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphereDual
    new Jax.Mesh.GeodesicSphereDual size: 2, subdivisions: 1

Demos:

* See geodes.js.coffee
###
class Jax.Mesh.GeodesicSphereDual extends Jax.Mesh.GeodesicSphere

  constructor: (options = {}) ->
    if options.subdivisions > 3 then console.warn "Dual Geode subdivided > 3 times is... -- BOOM -- Your computer just exploded."
    # Array of Jax.Geometry.Pentagon
    @pentagons = []
    # Array of Jax.Geometry.Hexagon
    @hexagons = []
    super options

  init: (vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) ->

    # Helpers

    isIn = (needleVertex, verticesHaystack) ->
      for vertex in verticesHaystack
        if vec3.equal(needleVertex, vertex) then return true
      return false

    # Get +howMuch+ closest vertices to +vertex+ from +vertices+ array
    getClosestVertices = (vertex, vertices, howMuch) ->
      howMuch = Math.min howMuch, vertices.length

      # Higher dot is closer ; A first = -1
      vertices.sort( (vA,vB) ->
        # We don't want the self in the closest
        if vA == vertex then return  1
        if vB == vertex then return -1
        return vec3.dot(vertex,vB) - vec3.dot(vertex,vA)
      )

      closestVertices = []
      for i in [0...howMuch] by 1
        closestVertices.push vertices[i]

      start = vec3.direction(vertex, closestVertices[0], [])
      # angle sort along axis +vertex+, trigowise (i think) in vertex/start/cross, angle zero at arbitrary +start+
      # the maths below work only in the geode context to find closest, beware
      closestVertices.sort (vA,vB) ->
        # think on a more idiomatic way to do this ?
        # rays from center vertex to adjacents
        dA = vec3.direction(vertex, vA, [])
        dB = vec3.direction(vertex, vB, [])

        # angle, not oriented
        a = vec3.dot(start, dA) + 1
        b = vec3.dot(start, dB) + 1

        # orient trigwise along the full circle
        dotA = vec3.dot(vertex, vec3.cross(start, dA, []))
        dotB = vec3.dot(vertex, vec3.cross(start, dB, []))
        if dotA < 0 then a *= -1
        if dotB < 0 then b *= -1

        b - a

      closestVertices

    # Business

    [ geodeVertices, geodeColors, geodeTextureCoords, geodeVertexNormals ] = [ [], [], [], [] ]

    # The whole following process could be optimized by using less math. Less is more.

    # Pass 1 : compute the geometry of a geode (we want its dual)
    super geodeVertices, geodeColors, geodeTextureCoords, geodeVertexNormals

    # Pass 2 : compute the faces' centers and the unique vertices
    uniqueGeodeVertices = []
    centerVertices = []
    for i in [0...geodeVertices.length] by 9
      a = [geodeVertices[i  ],geodeVertices[i+1],geodeVertices[i+2]]
      b = [geodeVertices[i+3],geodeVertices[i+4],geodeVertices[i+5]]
      c = [geodeVertices[i+6],geodeVertices[i+7],geodeVertices[i+8]]
      o = vec3.scale vec3.normalize(vec3.add(vec3.add(a, b, []), c)), @size

      uniqueGeodeVertices.push a unless isIn a, uniqueGeodeVertices
      uniqueGeodeVertices.push b unless isIn b, uniqueGeodeVertices
      uniqueGeodeVertices.push c unless isIn c, uniqueGeodeVertices

      centerVertices.push o

    # Pass 3 : scale the original icosahedron vertices for later comparison
    icosahedronVertices = @icosahedron.vertices.slice 0

    for i in [0...icosahedronVertices.length] by 1
      vec3.normalize icosahedronVertices[i]
      vec3.scale icosahedronVertices[i], @size

    # Pass 4 : for each geode vertex, add 5 or 6 triangles, and populate the +pentagons+ or +hexagons+
    currentVertexBufferIndex = 0
    for vertex in uniqueGeodeVertices

      if isIn(vertex, icosahedronVertices)
        n = 5
        @pentagons.push(new Jax.SubMesh.Pentagon(currentVertexBufferIndex)) # @dontmerge trying untested stuff
      else
        n = 6
        @hexagons.push(new Jax.SubMesh.Hexagon(currentVertexBufferIndex)) # @dontmerge trying untested stuff

      closestVertices = getClosestVertices vertex, centerVertices, n

      medianAltitude = [0,0,0]
      for i in [0...n] by 1
        vec3.add medianAltitude, closestVertices[i]
      medianAltitude = vec3.length(medianAltitude) / n

      # i'm doing a lot of these : normalize & scale
      # what about a vec3.normalizeScaled( vec, scale, dest ) ?
      vec3.normalize vertex
      vec3.scale vertex, medianAltitude

      for i in [0...n] by 1
        vertices.push vertex[0], vertex[1], vertex[2]
        vertices.push closestVertices[i][0], closestVertices[i][1], closestVertices[i][2]
        vertices.push closestVertices[(i+1)%n][0], closestVertices[(i+1)%n][1], closestVertices[(i+1)%n][2]

      currentVertexBufferIndex += n * 9

    # UVs
    # Each triangle face is one of two uv triangles, bottom-left or top-right
    # Proper default mapping is non-trivial
    # need uv mapping specs, spy and tools before further continuation
    for i in [0...vertices.length] by 9
      if i % 2 == 0
        textureCoords.push 0, 0, 1, 1, 1, 0
      else
        textureCoords.push 0, 0, 0, 1, 1, 1

    true # don't return an array, it's faster