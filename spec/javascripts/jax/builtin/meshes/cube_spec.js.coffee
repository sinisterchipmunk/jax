describe "Jax.Mesh.Cube", ->
  cube = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    cube = new Jax.Mesh.Cube()
  
  it "should rebuild without issue", ->
    for i in [0..10]
      cube.rebuild()
      expect(cube.vertices.length).toBeGreaterThan(0)
      
  it "should build successfully", ->
    cube.init verts, colors, texes, norms
  
  it "should default all colors to white", ->
    for vertex in cube.vertices
      expect(vertex.color).toEqualVector [1, 1, 1, 1]
  
  it "should allow altering of face color prior to build", ->
    cube.left.color = "#ff0000ff"
    colors = cube.getColorBuffer().js;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  it "should allow altering of face color after build", ->
    cube.getColorBuffer();
    cube.left.color = "#ff0000ff"
    colors = cube.getColorBuffer().js;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  describe "when a side has been changed", ->
    it "should update its vertices", ->
      cube.getColorBuffer();
      cube.left.camera.setPosition([10, 10, 10]);
      expect(cube.getVertexBuffer().js).toIncludeSubset([10, 9.5, 9.5]);
      