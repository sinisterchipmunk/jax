describe 'Jax.Mesh.Plane', ->
	plane = null

  describe 'with no options', ->
    beforeEach -> plane = new Jax.Mesh.Plane

    it 'should render', -> plane.render @context
