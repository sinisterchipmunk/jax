describe "Jax.Dev.Collections.Controllers", ->
  beforeEach ->
    Jax.Controller.create "test", {}
    @collection = new Jax.Dev.Collections.Controllers

  it 'should include Jax controllers', ->
    included = false
    @collection.each (m) -> included or= m.get('name') is 'test'
    expect(included).toBe true