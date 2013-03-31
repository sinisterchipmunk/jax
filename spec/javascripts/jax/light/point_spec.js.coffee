describe "Jax.Light.Point", ->
  light = null
  
  describe "with default options", ->
    beforeEach -> light = new Jax.Light.Point
  
    it "should be enabled", -> expect(light.enabled).toBeTruthy()
    it "should have a position", -> expect(light.position).not.toBeUndefined()
    it "should have a type", -> expect(light.type).toBeDefined()
    it "should have the correct type", -> expect(light.type).toEqual Jax.POINT_LIGHT
    it "should have constant attenuation", -> expect(light.attenuation.constant).toBeDefined()
    it "should have linear attenuation", -> expect(light.attenuation.linear).toBeDefined()
    it "should have quadratic attenuation", -> expect(light.attenuation.quadratic).toBeDefined()
    it "should have a diffuse color", -> expect(light.color.diffuse).toBeDefined()
    it "should have a specular color", -> expect(light.color.specular).toBeDefined()
