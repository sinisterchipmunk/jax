describe "Jax.Material.Paraboloid", ->
  matr = null
  beforeEach -> matr = new Jax.Material layers: [ { type: 'Paraboloid', direction: 1 } ]
  
  it "should render successfully", ->
    new Jax.Mesh.Triangles(material: matr).render SPEC_CONTEXT
