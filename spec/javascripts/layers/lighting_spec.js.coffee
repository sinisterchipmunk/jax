describe "Jax.Material.Lighting", ->
  matr = null
  beforeEach ->
    matr = new Jax.Material layers: [ { type: 'Lighting' } ]
    
  it "with no light sources", ->
    new Jax.Mesh.Sphere(material: matr)