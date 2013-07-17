describe "Jax.Mesh.Quad", ->
  quad = null
  beforeEach -> quad = new Jax.Mesh.Quad()
  
  it "should rebuild without issue", ->
    for i in [0..100]
      quad.rebuild()
    
  it "should render successfully", ->
    quad.render SPEC_CONTEXT
    