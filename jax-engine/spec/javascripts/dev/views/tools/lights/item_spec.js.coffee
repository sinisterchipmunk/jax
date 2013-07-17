describe "Jax.Dev.Views.Tools.Lights.Item", ->
  beforeEach ->
    @view = new Jax.Dev.Views.Tools.Lights.Item
      model: new Jax.Light

  itShouldBehaveLike "a drawer"
