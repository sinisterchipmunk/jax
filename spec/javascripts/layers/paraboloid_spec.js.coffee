describe "Jax.Material.Paraboloid", ->
  matr = null
  beforeEach -> matr = new Jax.Material layers: [ { type: 'Paraboloid' } ]
  
  it "should render successfully", ->
    new Jax.Mesh(material: matr).render SPEC_CONTEXT
    
  it "should render both sides", ->
    directions = []
    matr.drawBuffers = (context, mesh) -> directions.push @assigns.DP_DIRECTION
    new Jax.Mesh(material: matr).render SPEC_CONTEXT
    expect(directions).toEqual [1, -1]
