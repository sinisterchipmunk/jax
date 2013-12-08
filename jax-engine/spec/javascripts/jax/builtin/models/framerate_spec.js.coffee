describe 'Jax.Framerate', ->
  beforeEach -> @fr = new Jax.Framerate

  it 'should at least render without error', ->
    expect(=> @fr.render @context).not.toThrow()
