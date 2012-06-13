describe "Jax.ShadowMap.Directional", ->
  shadowmap = light = null
  beforeEach ->
    light = new Jax.Light.Directional position: [0,0,0], direction: [0,0,-1]
    shadowmap = new Jax.ShadowMap.Directional light
  
  it "should illuminate objects in front of it", ->
    model = new Jax.Model position: [0, 0, -1], mesh: new Jax.Mesh.Quad
    @world.addObject model
    expect(shadowmap.isIlluminated model, @context).toBeTrue()
    
  it "should not illuminate objects entirely obstructed by other objects", ->
    front = @world.addObject new Jax.Model position: [0, 0, -1], mesh: new Jax.Mesh.Quad(size: 1)
    back  = @world.addObject new Jax.Model position: [0, 0, -2], mesh: new Jax.Mesh.Quad(size: 0.5)
    expect(shadowmap.isIlluminated back, @context).toBeFalse()
    
  describe "oriented to face 'right'", ->
    beforeEach ->
      light.direction = [1, 0, 0]
    
    it "should illuminate objects in front", ->
      model = @world.addObject new Jax.Model position: [1, 0, 0], direction: [1, 0, 0], mesh: new Jax.Mesh.Quad(size: 1)
      expect(shadowmap.isIlluminated model, @context).toBeTrue()
      