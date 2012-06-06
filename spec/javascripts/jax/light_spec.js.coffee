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
    
  describe "a directional light", ->
    beforeEach ->
      light = new Jax.Light.Directional
    
    describe "with translated view", ->
      camera = null
      beforeEach ->
        camera = new Jax.Camera
        camera.lookAt [0,0,0], [0,0,5]
    
      it "should return eye direction same as direction more than once", ->
        light.direction = [-1, -1, -1]
        expect(light.eyeDirection camera.getNormalMatrix()).toEqualVector vec3.normalize([-1,-1,-1])
        expect(light.eyeDirection camera.getNormalMatrix()).toEqualVector vec3.normalize([-1,-1,-1])
  
  describe "a generic instance", ->
    beforeEach -> light = new Jax.Light
    
    it "should be enabled", -> expect(light.enabled).toBeTruthy()
    it "should have constant attenuation", -> expect(light.attenuation.constant).toBeDefined()
    it "should have linear attenuation", -> expect(light.attenuation.linear).toBeDefined()
    it "should have quadratic attenuation", -> expect(light.attenuation.quadratic).toBeDefined()
    it "should have a diffuse color", -> expect(light.color.diffuse).toBeDefined()
    it "should have a specular color", -> expect(light.color.specular).toBeDefined()
    it "should have an energy", -> expect(light.energy).toBeDefined()

