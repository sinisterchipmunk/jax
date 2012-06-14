//= require "shaders/lib/lights"

shared uniform int PASS;
shared uniform float ConstantAttenuation;
shared uniform float LinearAttenuation;
shared uniform float QuadraticAttenuation;

void main(void) {
  if (PASS != 0) {
    <% for (var LIGHT = 0; LIGHT < MAX_LIGHTS; LIGHT++) { %>
      cache(float, LightDistanceFromSurface[MAX_LIGHTS]) { LightDistanceFromSurface[<%= LIGHT %>] = 1.0; }

      float multiplier = 1.0;
      import(AttenuationMultiplier, multiplier *= AttenuationMultiplier);
      import(AttenuationMultiplier<%= LIGHT %>, multiplier *= AttenuationMultiplier<%= LIGHT %>);

      // the SkipAttenuation stuff will be optimized out by the compiler since it will
      // be essentially become a set of constant expressions
      int skipAttenuation = 0;
      import(SkipAttenuation, skipAttenuation += SkipAttenuation);
    
      if (skipAttenuation == 0)
        gl_FragColor.rgb *= multiplier / (ConstantAttenuation +
                                   LinearAttenuation * LightDistanceFromSurface[<%= LIGHT %>] +
                                   QuadraticAttenuation * pow(LightDistanceFromSurface[<%= LIGHT %>], 2.0));
    <% } %>
  }
}
