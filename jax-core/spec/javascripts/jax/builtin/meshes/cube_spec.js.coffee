FRONT1 = 0
FRONT2 = 1
BACK1  = 3
BACK2  = 4

describe "Jax.Mesh.Cube", ->
  cube = null
  verts = colors = texes = norms = null
  
  beforeEach ->
    [verts, colors, texes, norms] = [[], [], [], []]
    cube = new Jax.Mesh.Cube()

  describe "its front faces", ->
    t1 = t2 = null
    beforeEach ->
      t1 = new Jax.Geometry.Triangle()
      t2 = new Jax.Geometry.Triangle()
      verts = cube.data.vertexBuffer
      [i, j, k] = [FRONT1*3, FRONT1*3+1, FRONT1*3+2]
      t1.setComponents verts[i*3], verts[i*3+1], verts[i*3+2], \
                       verts[j*3], verts[j*3+1], verts[j*3+2], \
                       verts[k*3], verts[k*3+1], verts[k*3+2]
      [i, j, k] = [FRONT2*3, FRONT2*3+1, FRONT2*3+2]
      t2.setComponents verts[i*3], verts[i*3+1], verts[i*3+2], \
                       verts[j*3], verts[j*3+1], verts[j*3+2], \
                       verts[k*3], verts[k*3+1], verts[k*3+2]

    # the first side is known front-facing, so test it in object space
    it "should have CCW winding", ->
      expect(t1).toBeCounterClockwise()
      expect(t2).toBeCounterClockwise()

  describe "its back faces", ->
    t1 = t2 = null
    beforeEach ->
      t1 = new Jax.Geometry.Triangle()
      t2 = new Jax.Geometry.Triangle()
      verts = cube.data.vertexBuffer
      [i, j, k] = [BACK1*3, BACK1*3+1, BACK1*3+2]
      t1.setComponents verts[i*3], verts[i*3+1], verts[i*3+2], \
                       verts[j*3], verts[j*3+1], verts[j*3+2], \
                       verts[k*3], verts[k*3+1], verts[k*3+2]
      [i, j, k] = [BACK2*3, BACK2*3+1, BACK2*3+2]
      t2.setComponents verts[i*3], verts[i*3+1], verts[i*3+2], \
                       verts[j*3], verts[j*3+1], verts[j*3+2], \
                       verts[k*3], verts[k*3+1], verts[k*3+2]

    # the second side is known back-facing, so test it in object space
    it "should have CW winding", ->
      expect(t1).toBeClockwise()
      expect(t2).toBeClockwise()

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
    cube.validate();
    cube.left.color = "#ff0000ff"
    colors = cube.data.colorBuffer;
    expect(colors).toIncludeSubset([1, 0, 0, 1]);
    
  describe "when a side has been changed", ->
    it "should update its vertices", ->
      expect(cube.bounds.width).not.toEqual 10.5 # sanity check
      cube.rebuild();
      cube.left.camera.position = [10, 0, 0];
      expect(cube.bounds.width).toEqual 10.5
