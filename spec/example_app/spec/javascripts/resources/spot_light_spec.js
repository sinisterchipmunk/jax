describe("spot light", function() {
  var light;
  beforeEach(function() { light = Jax.Scene.LightSource.find("spot_light"); });
  
  it("should be enabled", function() { expect(light.isEnabled()).toBeTruthy(); });
  it("should be a shadowcaster", function() { expect(light.isShadowcaster()).toBeTruthy(); });
  it("should have position 0,0,30", function() { expect(light.getPosition()).toEqualVector([0,0,30]); });
  it("should have direction 0,0,-1", function() { expect(light.getDirection()).toEqualVector([0,0,-1]); });
  it("should have qaudr atten 0", function() { expect(light.getQuadraticAttenuation()).toEqual(0); });
  it("should have linear atten 0.04", function() { expect(light.getLinearAttenuation()).toEqual(0.04); });
  it("should have constant atten 0", function() { expect(light.getConstantAttenuation()).toEqual(0); });
  it("should be type SPOT", function() { expect(light.getType()).toEqual(Jax.SPOT_LIGHT); });
  it("should have spot expo 32", function() { expect(light.getSpotExponent()).toEqual(32); });
  it("should have angle PI/6", function() { expect(Math.abs(light.getAngle() - Math.PI/6)).toBeLessThan(Math.EPSILON); });
  it("should have ambient color 0.15,0.15,0.15,1", function() { expect(light.getAmbientColor()).toEqualVector([0.15,0.15,0.15,1]); });
  it("should have diffuse color 0.75,0.75,0.5,1", function() { expect(light.getDiffuseColor()).toEqualVector([0.75,0.75,0.5,1]); });
  it("should have specular color 1,1,1,1", function() { expect(light.getSpecularColor()).toEqualVector([1,1,1,1]); });
});