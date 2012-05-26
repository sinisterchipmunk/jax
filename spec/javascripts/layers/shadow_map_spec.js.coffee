describe "Jax.Material.ShadowMap", ->
  matr = null
  beforeEach -> matr = new Jax.Material layers: [ type: 'ShadowMap' ]
  
  it "should render successfully", ->
    new Jax.Mesh(material: matr).render SPEC_CONTEXT
