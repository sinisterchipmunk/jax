describe "Jax.Material.VertexColor", ->
  matr = mesh = model = null
  beforeEach ->
    matr = new Jax.Material type: "Custom", layers: [ { type: "VertexColor" } ]
    model = new Jax.Model
    mesh = new Jax.Mesh.Quad
    
  it "should render", ->
    matr.render SPEC_CONTEXT, mesh, model
