describe "Cube", ->
  cube = null
  beforeEach -> cube = new Jax.Mesh.Cube()
  
  it "should build successfully", ->
    [verts, colors, texes, norms] = []
    cube.init verts, colors, texes, norms
  
  