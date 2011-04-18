describe("Directional light", function() {
  var light;
  beforeEach(function() { light = Jax.Scene.LightSource.find("directional_light"); });
  
  it("should be enabled", function() { expect(light.isEnabled()).toBeTruthy(); });
  it("should cast shadows", function() { expect(light.isShadowcaster()).toBeTruthy(); });
  /* don't much care about position for a directional light */
  it("should have normalized direction -1,-1,-1", function() { expect(light.getDirection()).toEqualVector(vec3.normalize([-1,-1,-1])); });
  it("should have constant attenuation 1", function() { expect(light.getConstantAttenuation()).toEqual(1); });
  it("should have linear attenuation 0", function() { expect(light.getLinearAttenuation()).toEqual(0); });
  it("should have quadratic attenuation 0", function() { expect(light.getQuadraticAttenuation()).toEqual(0); });
  it("should have type DIRECTIONAL", function() { expect(light.getType()).toEqual(Jax.DIRECTIONAL_LIGHT); });
  it("should have ambient color 0,0,0,1", function() { expect(light.getAmbientColor()).toEqualVector([0,0,0,1]); });
  it("should have diffuse color 0,0,0.5,1", function() { expect(light.getDiffuseColor()).toEqualVector([0,0,0.5,1]); });
  it("should have specular color 0,0,0.75,1", function() { expect(light.getSpecularColor()).toEqualVector([0,0,0.75,1]); });
});