describe "Jax.Mesh.LineCube", ->
  cube = null

  beforeEach -> cube = new Jax.Mesh.Cube()

  it "should render", ->
    cube.render @context

  describe "initialized with a `size` option", ->
    beforeEach -> cube = new Jax.Mesh.Cube size: 2

    # its origin is [0,0,0], and it should have extents [1,1,1] - [-1,-1,-1] = [2,2,2]:
    it 'should have correct width',  -> expect(cube.bounds.width).toEqual 2
    it 'should have correct height', -> expect(cube.bounds.height).toEqual 2
    it 'should have correct depth',  -> expect(cube.bounds.depth).toEqual 2
