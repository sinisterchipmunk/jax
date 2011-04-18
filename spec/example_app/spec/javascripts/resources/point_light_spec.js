describe("Point lights", function() {
  var light;

  beforeEach(function() { light = Jax.Scene.LightSource.find("point_light"); });
  
  it("should be a shadowcaster", function() { expect(light.isShadowcaster()).toBeTruthy(); });
  it("should be enabled", function() { expect(light.isEnabled()).toBeTruthy(); });
  it('should be at -20,0,0', function() { expect(light.getPosition()).toEqualVector([-20,0,0]); });
  it("should point at 1,0,0", function() { expect(light.getDirection()).toEqualVector([1,0,0]); });
  it("should have type POINT", function() { expect(light.getType()).toEqual(Jax.POINT_LIGHT); });
  it("should have const attenuation 0", function() { expect(light.getConstantAttenuation()).toEqual(0); });
  it("should have linear attenuation 0", function() { expect(light.getLinearAttenuation()).toEqual(0); });
  it("should have quadr attenuation 0", function() { expect(light.getQuadraticAttenuation()).toEqual(0.00275); });
  it("should have ambient color 0,0,0,1", function() { expect(light.getAmbientColor()).toEqualVector([0,0,0,1]); });
  it("should have diffuse color .9,0,0,1", function() { expect(light.getDiffuseColor()).toEqualVector([0.9,0,0,1]); });
  it("should have specular color 0.75,0,0,1", function() { expect(light.getSpecularColor()).toEqualVector([0.75,0,0,1]); });
});
