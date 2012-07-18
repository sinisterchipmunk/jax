describe 'Jax.Mesh.Plane', ->
  plane = null

  describe 'with no options', ->
    beforeEach -> plane = new Jax.Mesh.Plane

    it 'should render', -> plane.render @context

  describe 'with height function', ->
    beforeEach -> plane = new Jax.Mesh.Plane width: 10, depth: 10, segments: 10, fn: (x, y) -> x * 10 + y

    it "should assign Z to function result", ->
      expect(plane.data.vertexBuffer).toIncludeSubset [-4, -4, 11]
