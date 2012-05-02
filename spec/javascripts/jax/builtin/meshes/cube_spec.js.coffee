describe "Cube", ->
  cube = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    cube = new Jax.Mesh.Cube()
  
  it "should build successfully", ->
    cube.init verts, colors, texes, norms
  
  it "should default all colors to white", ->
    cube.init verts, colors, texes, norms
    expect(colors).toEqualVector [
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 1
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 2
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 3
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 4
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 5
      1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, # side 6
    ]
  
  it "should allow altering of face color prior to build", ->
    cube.left.setColor 1, 0, 0, 1
    colors = cube.getColorBuffer().js;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  it "should allow altering of face color after build", ->
    cube.getColorBuffer();
    cube.left.setColor 1, 0, 0, 1
    colors = cube.getColorBuffer().js;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  describe "when a side has been changed", ->
    it "should update its vertices", ->
      cube.getColorBuffer();
      cube.left.camera.setPosition([10, 10, 10]);
      expect(cube.getVertexBuffer().js).toIncludeSubset([10, 9.5, 9.5]);
      