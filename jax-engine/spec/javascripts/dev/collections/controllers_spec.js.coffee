describe "Jax.Dev.Collections.Controllers", ->
  beforeEach ->
    class Test extends Jax.Controller
      Jax.controllers.add 'Test', this
    @collection = new Jax.Dev.Collections.Controllers

  it 'should include Jax controllers', ->
    included = false
    @collection.each (m) -> included or= m.get('name') is 'Test'
    expect(included).toBe true
  