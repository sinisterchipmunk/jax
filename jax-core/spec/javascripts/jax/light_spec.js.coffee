describe "Jax.Light", ->
  light = null
  
  it "should produce a legacy typed light", ->
    light = new Jax.Light type: "SPOT_LIGHT"
    expect(light).toBeInstanceOf(Jax.Light.Spot)

  it "should produce a legacy numeric typed light", ->
    light = new Jax.Light type: Jax.SPOT_LIGHT
    expect(light).toBeInstanceOf(Jax.Light.Spot)

  it "should produce a new typed light", ->
    light = new Jax.Light type: "Spot"
    expect(light).toBeInstanceOf(Jax.Light.Spot)
    
  it "should set colors from options", ->
    light = new Jax.Light color: {ambient: [1,1,1,1], diffuse: [2,2,2,2], specular: [3,3,3,3]}
    expect(light.color.ambient.toVec4()).toEqual [1,1,1,1]
    expect(light.color.diffuse.toVec4()).toEqual [2,2,2,2]
    expect(light.color.specular.toVec4()).toEqual [3,3,3,3]

  describe "a generic instance", ->
    beforeEach -> light = new Jax.Light
    
    it "should be enabled", -> expect(light.enabled).toBeTruthy()
    it "should have constant attenuation", -> expect(light.attenuation.constant).toBeDefined()
    it "should have linear attenuation", -> expect(light.attenuation.linear).toBeDefined()
    it "should have quadratic attenuation", -> expect(light.attenuation.quadratic).toBeDefined()
    it "should have a diffuse color", -> expect(light.color.diffuse).toBeDefined()
    it "should have a specular color", -> expect(light.color.specular).toBeDefined()

    it "should set ambient color from string", ->    
      light.color.ambient = '#123'
      expect(light.color.ambient).toEqual Jax.Color.parse('#123')

    it "should set diffuse color from string", ->    
      light.color.diffuse = '#123'
      expect(light.color.diffuse).toEqual Jax.Color.parse('#123')

    it "should set specular color from string", ->    
      light.color.specular = '#123'
      expect(light.color.specular).toEqual Jax.Color.parse('#123')
      