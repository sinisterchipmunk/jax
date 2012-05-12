describe "Jax.Mesh.Quad", ->
  quad = null
  beforeEach -> quad = new Jax.Mesh.Quad()
  
  it "should be drawn as a triangle strip", ->
    expect(quad.draw_mode).toEqual GL_TRIANGLE_STRIP
    
  it "should rebuild without issue", ->
    for i in [0..100]
      quad.rebuild()
    