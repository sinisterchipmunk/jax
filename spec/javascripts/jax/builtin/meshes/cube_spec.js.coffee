describe "Jax.Mesh.Cube", ->
  cube = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    cube = new Jax.Mesh.Cube()
  
  it "should rebuild without issue", ->
    for i in [0..10]
      cube.rebuild()
      expect(cube.data.vertexBuffer.length).toBeGreaterThan(0)
      
  it "should build successfully", ->
    cube.init verts, colors, texes, norms
  
  it "should default all colors to white", ->
    for ofs in [0...cube.data.colorBuffer.length] by 4
      expect(cube.data.colorBuffer[ofs]).toEqual 1
      expect(cube.data.colorBuffer[ofs+1]).toEqual 1
      expect(cube.data.colorBuffer[ofs+2]).toEqual 1
      expect(cube.data.colorBuffer[ofs+3]).toEqual 1
  
  it "should allow altering of face color prior to build", ->
    cube.left.color = "#ff0000ff"
    colors = cube.data.colorBuffer;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  it "should allow altering of face color after build", ->
    cube.rebuild();
    cube.left.color = "#ff0000ff"
    colors = cube.data.colorBuffer;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  describe "when a side has been changed", ->
    it "should update its vertices", ->
      cube.rebuild();
      cube.left.camera.setPosition([10, 10, 10]);
      expect(cube.data.vertexBuffer).toIncludeSubset([10, 9.5, 9.5]);
      