
describe "Jax.Mesh.Icosahedron", ->
  icosa = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    icosa = new Jax.Mesh.Icosahedron()

  describe "its faces", ->

    it "should be 20", ->
      #fixme

    it "should be equilateral triangles", ->
      #fixme

    it "should organize in centrally symmetric pairs", ->
      #fixme


  describe "its vertices", ->

    it "should be 12", ->
      #fixme

    it "should all have the same length", ->
      #fixme

    it "should organize in diametrally opposite pairs", ->
      #fixme



  it "should build successfully", ->
    icosa.init verts, colors, texes, norms # not sure

  it "should rebuild successfully", ->
    for i in [0..10] # why 10 times specifically ?
      icosa.rebuild()
      expect(icosa.data.vertexBuffer.length).toBeGreaterThan(0)

  it "should default all colors to white", ->
    #fixme
#    for ofs in [0...icosa.data.colorBuffer.length] by 4
#      expect(icosa.data.colorBuffer[ofs+0]).toEqual 1
#      expect(icosa.data.colorBuffer[ofs+1]).toEqual 1
#      expect(icosa.data.colorBuffer[ofs+2]).toEqual 1
#      expect(icosa.data.colorBuffer[ofs+3]).toEqual 1

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
