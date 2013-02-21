
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

    beforeEach ->
      icosa.rebuild()

    # Is there a (high-level) way of getting the faces ?
    # Is it the model's job ?

    it "should be 20", ->
      #fixme

    it "should be equilateral triangles", ->
      #fixme

    it "should organize in centrally symmetric pairs", ->
      #fixme


  describe "its vertices", ->

    it "should be 12", ->
      expect(icosa.data.vertexBuffer.length).toBe(12*3);

    it "should all have the same length", ->
      #fixme: can i haz vertices as Vector3's ? If not, why not ? Perf ? Maybe it's the model's job too ?

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
