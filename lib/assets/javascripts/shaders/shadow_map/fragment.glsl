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

float dp_lookup(vec2 offset, sampler2D shadowmap) {
  vec4 rgba_depth = texture2D(shadowmap, shadowCoord.xy * 0.5 + 0.5 + offset);
  float shadowDepth = unpack_depth(rgba_depth);
  if (shadowDepth == 0.0) return 1.0;
  if (shadowDepth - shadowCoord.z > -0.005)
    return 1.0;
  else
    return 0.0;
}
      
float depth_lookup(vec2 offset, sampler2D shadowmap) {
  vec4 rgba_depth = texture2D(shadowmap, shadowCoord.xy + offset);
  float d = unpack_depth(rgba_depth);
  if (d == 0.0) return 1.0;
  if (shadowCoord.z - d > 0.00002)
    return 0.0;
  else
    return 1.0;
}

void main() {
  /* if (a && b) is broken on some hardware, use if (all(bvec)) instead */
  float visibility = 1.0;
  if (PASS != 0) {
    float dx, dy;
    bool front;

    if (SHADOWMAP_ENABLED) {
      shadowCoord = vShadowCoord / vShadowCoord.w;
      visibility = 0.0;
      dx = 1.0 / SHADOWMAP_WIDTH;
      dy = 1.0 / SHADOWMAP_HEIGHT;
      front = false;

      // for PCF, nested loops break on some ATI cards, so the loop must be unrolled
      // explicitly. Luckily we have EJS....

      if (IsDualParaboloid) {
        if (shadowCoord.z > 0.0) front = true;
        else shadowCoord.z *= -1.0;
        mapToParaboloid(shadowCoord, ParaboloidNear, ParaboloidFar);
        shadowCoord.z = shadowCoord.z * 0.5 + 0.5;
        
        if (front) {
          if (SHADOWMAP_PCF_ENABLED) {
            <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>
              <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>
                visibility += dp_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP0);
              <% } %>
            <% } %>
            visibility /= 9.0;
          } else {
            visibility += dp_lookup(vec2(0.0, 0.0), SHADOWMAP0);
          }
        } else {
          if (SHADOWMAP_PCF_ENABLED) {
            <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>
              <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>
                visibility += dp_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP1);
              <% } %>
            <% } %>
            visibility /= 9.0;
          } else {
            visibility += dp_lookup(vec2(0.0, 0.0), SHADOWMAP1);
          }
        }
      } else {
        if (SHADOWMAP_PCF_ENABLED) {
          <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>
            <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>
              visibility += depth_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP0);
            <% } %>
          <% } %>
          visibility /= 9.0;
        } else {
          visibility += depth_lookup(vec2(0.0, 0.0), SHADOWMAP0);
        }
      }
    }
  }

  gl_FragColor.rgb *= visibility;
}
