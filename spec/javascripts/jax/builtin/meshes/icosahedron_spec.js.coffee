
###
Costly, for testing

@param  {Jax.Mesh}
@return {Array} of 3D vectors
###
getMeshVerticesAsVectors = (mesh) ->
  [vertices, vector] = [ [], [] ]
  i = 0

  for coordinate in mesh.data.vertexWrapper.buffer # or mesh.data.vertexBuffer ?

    vector.push coordinate
    i++

    if i > 2
      vertices.push( vec3.create vector )
      vector.length = i =0

  vertices


###
Returns an array containing the elements of iterable, without any doubles
Todo: make results of the same type as iterable

@param {Array|Object} iterable
@return {Array}
###
unique = (iterable) ->
  results = []

  contains = (haystack, needle) ->
    for straw in haystack
      match = true
      for value, key in needle
        match = false unless straw[key] == value
      return true if match
    false

  for item in iterable
    results.push(item) unless contains(results, item)

  results


###################################

describe "Jax.Mesh.Icosahedron", ->
  icosa = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    icosa = new Jax.Mesh.Icosahedron()

  it "should build successfully", ->
    icosa.init verts, colors, texes, norms
    expect(verts.length).toBeGreaterThan(0)

  it "should rebuild successfully", ->
    for i in [0..10] # why 10 times specifically ?
      icosa.rebuild()
      expect(icosa.data.vertexBuffer.length).toBeGreaterThan(0)


  describe "its faces", ->

    #beforeEach ->
      #icosa.rebuild()


    it "should be 20", ->
      #fixme

    it "should be equilateral triangles", ->
      #fixme

    it "should organize in centrally symmetric pairs", ->
      #fixme


  describe "its vertices", ->

    vertices = uniqueVertices = null;

    beforeEach ->
      vertices = getMeshVerticesAsVectors icosa
      uniqueVertices = unique vertices

    it "should be 60 overall (20 faces, 3 vertices each)", ->
      expect(vertices.length).toBe(60)

    it "should regroup in 12 unique vertices", ->
      expect(uniqueVertices.length).toBe(12)

    it "should all have the size of the icosahedron as length", ->
      for v in vertices
        expect(vec3.length(v)).toBeCloseTo(icosa.size)

    it "should organize in diametrally opposite pairs", ->
      #fixme




  it "should default all colors to white", ->
    for ofs in [0...icosa.data.colorBuffer.length] by 4
      expect(icosa.data.colorBuffer[ofs+0]).toEqual 1
      expect(icosa.data.colorBuffer[ofs+1]).toEqual 1
      expect(icosa.data.colorBuffer[ofs+2]).toEqual 1
      expect(icosa.data.colorBuffer[ofs+3]).toEqual 1

  it "should allow altering of face color prior to build", ->
    #fixme
#    cube.left.color = "#ff0000ff"
#    colors = cube.data.colorBuffer;
#    expect(colors).toIncludeSubset([1, 0, 0, 1]);

  it "should allow altering of face color after build", ->
    #fixme
#    cube.validate();
#    cube.left.color = "#ff0000ff"
#    colors = cube.data.colorBuffer;
#    expect(colors).toIncludeSubset([1, 0, 0, 1]);

  describe "when a side has been changed", ->
    it "should update its vertices", ->
      #fixme
#      expect(cube.bounds.width).not.toEqual 10.5 # sanity check
#      cube.rebuild();
#      cube.left.camera.position = [10, 0, 0];
#      expect(cube.bounds.width).toEqual 10.5
