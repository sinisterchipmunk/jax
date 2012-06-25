describe "Jax.Material.Paraboloid", ->
  matr = null
  beforeEach -> matr = new Jax.Material direction: 1, layers: [ { type: 'Paraboloid' } ]
  
  it "should render successfully", ->
    new Jax.Mesh.Triangles(material: matr).render SPEC_CONTEXT
