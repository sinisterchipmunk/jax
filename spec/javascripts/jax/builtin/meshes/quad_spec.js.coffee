describe "Jax.Mesh.Quad", ->
  quad = null
  beforeEach -> quad = new Jax.Mesh.Quad()
  
  it "should be drawn as a triangle strip", ->
    expect(quad.draw_mode).toEqual GL_TRIANGLE_STRIP
    
  it "should rebuild without issue", ->
    for i in [0..100]
      quad.rebuild()
    
  it "should allocate data for 4 vertices", ->
    expect(quad.data.vertexBuffer.length).toEqual 12
    expect(quad.data.normalBuffer.length).toEqual 12
    expect(quad.data.colorBuffer.length).toEqual 16
    expect(quad.data.textureCoordsBuffer.length).toEqual 8
    expect(quad.data.indexBuffer.length).toEqual 4

  it "should render successfully", ->
    quad.render SPEC_CONTEXT
    