//= require "shaders/functions/depth_map"
//= require "shaders/functions/paraboloid"

vec4 shadowCoord;

/*
  Since we set the clear color to transparent while rendering the
  shadowmap, no depth recorded in texture means nothing blocked the
  light.
  
  This is what allows us to do testing beyond the view frustum
  of the shadow matrix, so at the cost of a branching operation it's
  much more accurate when some objects such as the floor are
  excluded from casting shadows.
*/

float dp_lookup(const vec2 offset, const bool front) {
  vec4 rgba_depth;
  
  if (front) rgba_depth = texture2D(SHADOWMAP0, shadowCoord.xy * 0.5 + 0.5 + offset);
  else rgba_depth = texture2D(SHADOWMAP1, shadowCoord.xy * 0.5 + 0.5 + offset);
  
  float shadowDepth = unpack_depth(rgba_depth);
  if (shadowDepth < 0.005) return 1.0;
  if (shadowDepth - shadowCoord.z > -0.005) return 1.0;
  return 0.0;
}
      
float depth_lookup(const vec2 offset) {
  vec4 rgba_depth = texture2D(SHADOWMAP0, shadowCoord.xy + offset);
  float d = unpack_depth(rgba_depth);
  if (d == 0.0) return 1.0;
  return shadowCoord.z - d > 0.00002 ? 0.0 : 1.0;
}

void main() {
  /* if (a && b) is broken on some hardware, use if (all(bvec)) instead */
  bvec2 shouldRender = bvec2(PASS != 0, SHADOWMAP_ENABLED);
  float visibility = 1.0;
  if (all(shouldRender)) {
    shadowCoord = vShadowCoord / vShadowCoord.w;
    
    // for PCF, nested loops break on some ATI cards, so the loop must be unrolled
    // explicitly. Luckily we have EJS....

    visibility = 0.0;
    float dx = 1.0 / SHADOWMAP_WIDTH, dy = 1.0 / SHADOWMAP_HEIGHT;

    if (IsDualParaboloid) {
      bool front = false;
      shadowCoord = vShadowCoord;
      shadowCoord /= shadowCoord.w;
      if (shadowCoord.z > 0.0) front = true;
      else shadowCoord.z *= -1.0;
      mapToParaboloid(shadowCoord, 0.1, 500.0);
      shadowCoord.z = shadowCoord.z * 0.5 + 0.5;

      <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>
        <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>
          visibility += dp_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), front);
        <% } %>
      <% } %>
      visibility /= 9.0;
    } else {
      <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>
        <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>
          visibility += depth_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy));
        <% } %>
      <% } %>
      visibility /= 9.0;
    }
  }

  export(float, AttenuationMultiplier, visibility);
}
