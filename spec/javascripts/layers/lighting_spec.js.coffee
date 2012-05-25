describe "Jax.Material.Lighting", ->
  matr = null
  beforeEach ->
    matr = new Jax.Material layers: [ { type: 'Lighting' } ]
    
  it "should render successfully", ->
    new Jax.Mesh(material: matr).render SPEC_CONTEXT
