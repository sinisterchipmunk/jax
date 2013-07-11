###
A basic Geodesic Sphere Dual mesh
Its faces are 12 pentagons and the rest are hexagons.
Of course, these are made of respectively 5 and 6 triangles,
almost equilaterals.

With 0 subdivisions, it's a dodecahedron (12 pentagons, 0 hexagon)
With 1, it looks like a football
With 2, it looks like a golfball
With 3 and more, it looks like a Civilization V map

Default UV mapping is homotilic.
Homotilic : all hexagons share the same UV mapping, and all pentagons too.
The texture is divided in two squares.
On the left, fill the inscribed pentagon of the inscribed circle of the left square.
On the right, fill the inscribed hexagon of the inscribed circle of the right square.
Both polygons point upwards.

Don't use it with more than 3 subdivisions.
¡ THIS SCALES BADLY ! O(4^n) at least

Options:

- size : the size of the geode in units. Defaults to 1.0.
- subdivisions : the number of times each face is divided into 4 triangles before dualization. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphereDual
    new Jax.Mesh.GeodesicSphereDual size: 2, subdivisions: 1

Demos:

* See geodes.js.coffee
###
class Jax.Mesh.GeodesicSphereDual extends Jax.Mesh.GeodesicSphere

  constructor: (options = {}) ->
    if options.subdivisions > 3 then console.warn "Dual Geode subdivided > 3 times is not supported"
    # Array of Jax.Geometry.Pentagon
    @pentagons = []
    # Array of Jax.Geometry.Hexagon
    @hexagons = []
    super options

  init: (vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) ->

    ## Helpers

    # Is needle in haystack ?
    isIn = (needleVertex, verticesHaystack) ->
      for vertex in verticesHaystack
        if vec3.distance(needleVertex, vertex) < Math.EPSILON then return true
      return false

    # Get +howMuch+ closest vertices to +vertex+ from +vertices+ array
    # the maths below work only in the geode context to find closest, beware
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

      start = vec3.subtract([], closestVertices[0], vertex)
      vec3.normalize(start, start)
      # angle sort along axis +vertex+, trigowise in ref. vertex/start/cross, angle zero at arbitrary +start+

      _vA = vec3.create()
      _vB = vec3.create()
      closestVertices.sort (vA,vB) ->
        # think on a more idiomatic way to do this ? Using referential change and Math.atan2(y,x) ?

        # rays from center vertex to adjacents
        dA = vec3.normalize(_vA, vec3.subtract(_vA, vA, vertex))
        dB = vec3.normalize(_vB, vec3.subtract(_vB, vB, vertex))

        # angle, not oriented
        a = vec3.dot(start, dA) + 1
        b = vec3.dot(start, dB) + 1

        # orient trigwise along the full circle
        dotA = vec3.dot(vertex, vec3.cross([], start, dA))
        dotB = vec3.dot(vertex, vec3.cross([], start, dB))
        if dotA < 0 then a *= -1
        if dotB < 0 then b *= -1

        b - a

      closestVertices

    ## Mesh Factory

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
      o = vec3.scale [], vec3.normalize([], vec3.add([], vec3.add([], a, b), c)), @size

      uniqueGeodeVertices.push a unless isIn a, uniqueGeodeVertices
      uniqueGeodeVertices.push b unless isIn b, uniqueGeodeVertices
      uniqueGeodeVertices.push c unless isIn c, uniqueGeodeVertices

      centerVertices.push o

    # Pass 3 : scale the original icosahedron vertices for later comparison
    icosahedronVertices = @icosahedron.vertices.slice 0

    for i in [0...icosahedronVertices.length] by 1
      vec3.normalize icosahedronVertices[i], icosahedronVertices[i]
      vec3.scale icosahedronVertices[i], icosahedronVertices[i], @size

    # Pass 4 : for each geode vertex, add 5 or 6 triangles
    currentVertexBufferIndex = 0
    for vertex in uniqueGeodeVertices

      if isIn(vertex, icosahedronVertices)
        n = 5
        @_pushPentagonUV textureCoords
      else
        n = 6
        @_pushHexagonUV textureCoords

      closestVertices = getClosestVertices vertex, centerVertices, n

      medianAltitude = [0,0,0]
      for i in [0...n] by 1
        vec3.add medianAltitude, medianAltitude, closestVertices[i]
      medianAltitude = vec3.length(medianAltitude) / n

      # i'm doing a lot of these : normalize & scale
      # what about a vec3.normalizeScaled( vec, scale, dest ) ? or normalizeToScale ?
      vec3.normalize vertex, vertex
      vec3.scale vertex, vertex, medianAltitude

      for i in [0...n] by 1
        vertices.push vertex[0], vertex[1], vertex[2]
        vertices.push closestVertices[i][0], closestVertices[i][1], closestVertices[i][2]
        vertices.push closestVertices[(i+1)%n][0], closestVertices[(i+1)%n][1], closestVertices[(i+1)%n][2]

      currentVertexBufferIndex += n * 9


    true # don't return an array, it's faster





  ### HOMOTILIC UV MAPPING HELPERS

  The data about the pentagon and the hexagon should be somehow moved
  respectively to Jax.Geometry.Pentagon and Jax.Geometry.Hexagon ?

  todo: decide on a version of the referential change maths below
  Compiled :
  - perfs "should" be a tad better
  - less explicit / reusable / understandable

  ###

  _pushPentagonUV: (intoUVs) ->
    c1 = (Math.sqrt(5)-1)/4
    c2 = (Math.sqrt(5)+1)/4
    s1 = (Math.sqrt(10+2*Math.sqrt(5)))/4
    s2 = (Math.sqrt(10-2*Math.sqrt(5)))/4

    # pentagon vertices in classic centric referential
#    vertices = [
#      [   0,   0 ] # center
#      [   0,   1 ] # top
#      [ -s1,  c1 ] # rotate trigwise
#      [ -s2, -c2 ] # rotate trigwise
#      [  s2, -c2 ] # rotate trigwise
#      [  s1,  c1 ] # rotate trigwise
#    ]

    # from the classic centric referential to UV referential
#    o = [ 1, 1 ]
#    for v in vertices
#      v[1] *= -1 # invert y
#      vec2.add v, v, o # add the referential offset
#      v[0] *= 1/4 # scale to UV referential, X-wise
#      v[1] *= 1/2 # scale to UV referential, Y-wise

    # referential change from classic centric referential
    # x' = ( x + 1 )

    # compiled version
    vertices = [
      [       1/4, 1/2       ] # center
      [       1/4, 0         ] # top
      [ (-s1+1)/4, (-c1+1)/2 ] # rotate trigwise
      [ (-s2+1)/4, (c2+1)/2  ] # rotate trigwise
      [  (s2+1)/4, (c2+1)/2  ] # rotate trigwise
      [  (s1+1)/4, (-c1+1)/2 ] # rotate trigwise
    ]

    o = vertices.shift()
    @_pushTriangleFanUV o, vertices, intoUVs
    undefined


  _pushHexagonUV: (intoUVs) ->
    h = Math.sqrt(3)/2

    # hexagon vertices in classic centric referential
#    vertices = [
#      [    0,    0 ] # center
#      [    0,    1 ] # top
#      [   -h,  0.5 ] # rotate trigwise
#      [   -h, -0.5 ] # rotate trigwise
#      [    0,   -1 ] # rotate trigwise
#      [    h, -0.5 ] # rotate trigwise
#      [    h,  0.5 ] # rotate trigwise
#    ]
#
    # from the classic centric referential to UV referential
#    o = [ 1, 1 ]
#    for v in vertices
#      v[1] *= -1 # invert y
#      vec2.add v, v, o # add the referential offset
#      v[0] *= 1/4 # scale to UV referential, X-wise
#      v[1] *= 1/2 # scale to UV referential, Y-wise
#      # and...
#      v[0] += 0.5 # pentagon is on the right

    vertices = [
      [      3/4, 1/2 ] # center
      [      3/4, 0   ] # top
      [ (-h+3)/4, 1/4 ] # rotate trigwise
      [ (-h+3)/4, 3/4 ] # rotate trigwise
      [      3/4, 1   ] # rotate trigwise
      [  (h+3)/4, 3/4 ] # rotate trigwise
      [  (h+3)/4, 1/4 ] # rotate trigwise
    ]

    o = vertices.shift()
    @_pushTriangleFanUV o, vertices, intoUVs
    undefined


  _pushTriangleFanUV: (centerVertex, fanVertices, intoUVs) ->
    len = fanVertices.length
    for i in [0...len] by 1
      v1 = fanVertices[(i+0)%len]
      v2 = fanVertices[(i+1)%len]
      intoUVs.push centerVertex..., v1..., v2...
    undefined

