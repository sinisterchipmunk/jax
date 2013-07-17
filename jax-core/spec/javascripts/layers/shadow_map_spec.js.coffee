describe "Jax.Material.ShadowMap", ->
  matr = null
  beforeEach -> matr = new Jax.Material layers: [ type: 'ShadowMap' ]
  
  it "should render successfully", ->
    new Jax.Mesh.Triangles(material: matr).render SPEC_CONTEXT

  describe "with a directional light", ->
    beforeEach -> @world.addLight new Jax.Light.Directional
