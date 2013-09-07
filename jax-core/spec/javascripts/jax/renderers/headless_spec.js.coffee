describe "Jax.Renderers.Headless", ->
  beforeEach -> @renderer = new Jax.Renderer.Headless

  itShouldBehaveLike 'a renderer'
