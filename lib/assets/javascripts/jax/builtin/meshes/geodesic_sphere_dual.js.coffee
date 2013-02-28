###
A Geodesic Sphere Dual mesh
Its faces are 12 pentagons and the rest are hexagons. Of course, these are made of respectively 5 and 6 triangles.

With 0 subdivisions, it's a dodecahedron (12 pentagons, 0 hexagon)
With 1, it looks like a football
With 2, it looks like a golfball
With 3 and above, it looks like a Civilization V map

Don't use it with more than 4 subdivisions

¡ THIS IS ACHINGLY SLOW !

Options:

* size : the size of the geode in units. Defaults to 1.0.
* subdivisions : the number of times each face is divided into 4 triangles before dualization. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphereDual
    new Jax.Mesh.GeodesicSphereDual size: 2, subdivisions: 1
###
class Jax.Mesh.GeodesicSphereDual extends Jax.Mesh.GeodesicSphere

  constructor: (options = {}) ->
    super options

  init: (vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) ->

    # Helpers

    isIn = (needleVertex, verticesHaystack) ->
      for vertex in verticesHaystack
        if vec3.equal(needleVertex, vertex) then return true
      return false

    getClosestVertices = (vertex, vertices, howMuch) ->
      howMuch = Math.min howMuch, vertices.length

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
      closestVertices.sort (vA,vB) ->
        dA = vec3.direction(vertex, vA, [])
        dB = vec3.direction(vertex, vB, [])
        cA = vec3.cross(start, dA, [])
        cB = vec3.cross(start, dB, [])
        dotA = vec3.dot(vertex, cA)
        dotB = vec3.dot(vertex, cB)

        cosA = vec3.dot(start, dA)
        cosB = vec3.dot(start, dB)

        a = cosA + 1
        b = cosB + 1

        if dotA < 0 then a *= -1
        if dotB < 0 then b *= -1

        b - a

      closestVertices

    # Business

    [ geodeVertices, geodeColors, geodeTextureCoords, geodeVertexNormals ] = [ [], [], [], [] ]

    # Pass 1 : compute the geometry of a geode (if you can compute without doing that, be my guest)
    super geodeVertices, geodeColors, geodeTextureCoords, geodeVertexNormals

    # Pass 2 : compute the faces' centers and the unique vertices
    uniqueGeodeVertices = []
    centerVertices = []
    for i in [0...geodeVertices.length] by 9
      a = [geodeVertices[i+0],geodeVertices[i+1],geodeVertices[i+2]]
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

    # Pass 4 : for each geode vertex, add 5 or 6 triangles
    for vertex in uniqueGeodeVertices

      if isIn(vertex, icosahedronVertices)
        n = 5
      else
        n = 6

      closestVertices = getClosestVertices vertex, centerVertices, n

      medianAltitude = [0,0,0]
      for i in [0...n] by 1
        vec3.add medianAltitude, closestVertices[i]
      medianAltitude = vec3.length(medianAltitude) / n

      vec3.normalize vertex
      vec3.scale vertex, medianAltitude

      for i in [0...n] by 1
        vertices.push vertex[0], vertex[1], vertex[2]
        vertices.push closestVertices[i][0], closestVertices[i][1], closestVertices[i][2]
        vertices.push closestVertices[(i+1)%n][0], closestVertices[(i+1)%n][1], closestVertices[(i+1)%n][2]


    # fixme: UVs !

    true # don't return an array, it's faster