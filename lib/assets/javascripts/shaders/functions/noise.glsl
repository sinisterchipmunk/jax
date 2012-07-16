/**
 * Classic and 'improved' (simplex) Perlin noise.
 *
 * This implementation attempts to use texture-based lookups if the client
 * hardware can support it. This is no problem in fragment shaders but can
 * be an issue in vertex shaders, where VTL is not supported by about 20%
 * of clients.
 *
 * In the event this is a vertex shader *and* the client doesn't support
 * VTL, the functions will fall back to 'ashima' noise
 * (https://github.com/ashima/webgl-noise) for a slower, non-texture-based
 * implementation.
 **/
 
<% if (shaderType != 'vertex' || maxVertexTextureImageUnits > 0) { %>
  /*
   * Author: Stefan Gustavson (stegu@itn.liu.se) 2004, 2005, 2012
   * Stefan's original implementation: http://www.itn.liu.se/~stegu/simplexnoise/
   */


  /*
   * 2D, 3D and 4D Perlin noise, classic and simplex, in a GLSL fragment shader.
   *
   * Classic noise is implemented by the functions:
   * float noise(vec2 P)
   * float noise(vec3 P)
   * float noise(vec4 P)
   *
   * Simplex noise is implemented by the functions:
   * float snoise(vec2 P)
   * float snoise(vec3 P)
   * float snoise(vec4 P)
   *
   * Author: Stefan Gustavson ITN-LiTH (stegu@itn.liu.se) 2004-12-05
   * Simplex indexing functions by Bill Licea-Kane, ATI (bill@ati.com)
   * Modified to use same texture for 2D, 3D and 4D 2012-03-27.
   *
   * You may use, modify and redistribute this code free of charge,
   * provided that the author's names and this notice appear intact.
   */

  /*
   * The value of classic 4D noise goes above 1.0 and below -1.0 at some
   * points. Not much and only very sparsely, but it happens. This is a
   * long standing bug from Perlin's original software implementation,
   * so I left it untouched.
   */


  /*
   * "gradTexture" is a 256x256 RGBA texture that is used for both the
   * permutations, encoded in A, and the 2D, 3D and 4D gradients,
   * encoded in RGB with x in R, y in B and z and w combined in B.
   * For details, see the main C program.
   */
  shared uniform sampler2D gradTexture;

  /*
   * To create offsets of one texel and one half texel in the
   * texture lookup, we need to know the texture image size.
   */
  #define ONE 0.00390625
  #define ONEHALF 0.001953125
  // The numbers above are 1/256 and 0.5/256, change accordingly
  // if you change the code to use another texture size.


  /*
   * The interpolation function for classic noise. This could be a 1D texture
   * lookup to possibly gain some speed, but it's not the main part of the
   * algorithm, and the texture bandwidth is pretty choked up as it is.
   */
  shared float fade(float t) {
    // return t*t*(3.0-2.0*t); // Old fade, yields discontinuous second derivative
    return t*t*t*(t*(t*6.0-15.0)+10.0); // Improved fade, yields C2-continuous noise
  }

  /*
   * Efficient simplex indexing functions by Bill Licea-Kane, ATI. Thanks!
   * (This was originally implemented as a 1D texture lookup. Nice to avoid that.)
   */
  shared void simplex( const in vec3 P, out vec3 offset1, out vec3 offset2 )
  {
    vec3 offset0;
 
    vec2 isX = step( P.yz, P.xx ); // P.x >= P.y ? 1.0 : 0.0;  P.x >= P.z ? 1.0 : 0.0;
    offset0.x  = isX.x + isX.y;    // Accumulate all P.x >= other channels in offset.x
    offset0.yz = 1.0 - isX;        // Accumulate all P.x <  other channels in offset.yz

    float isY = step( P.z, P.y );  // P.y >= P.z ? 1.0 : 0.0;
    offset0.y += isY;              // Accumulate P.y >= P.z in offset.y
    offset0.z += 1.0 - isY;        // Accumulate P.y <  P.z in offset.z
 
    // offset0 now contains the unique values 0,1,2 in each channel
    // 2 for the channel greater than other channels
    // 1 for the channel that is less than one but greater than another
    // 0 for the channel less than other channels
    // Equality ties are broken in favor of first x, then y
    // (z always loses ties)

    offset2 = clamp( offset0, 0.0, 1.0 );
    // offset2 contains 1 in each channel that was 1 or 2
    offset1 = clamp( offset0-1.0, 0.0, 1.0 );
    // offset1 contains 1 in the single channel that was 1
  }

  shared void simplex( const in vec4 P, out vec4 offset1, out vec4 offset2, out vec4 offset3 )
  {
    vec4 offset0;
 
    vec3 isX = step( P.yzw, P.xxx );        // See comments in 3D simplex function
    offset0.x = isX.x + isX.y + isX.z;
    offset0.yzw = 1.0 - isX;

    vec2 isY = step( P.zw, P.yy );
    offset0.y += isY.x + isY.y;
    offset0.zw += 1.0 - isY;
 
    float isZ = step( P.w, P.z );
    offset0.z += isZ;
    offset0.w += 1.0 - isZ;

    // offset0 now contains the unique values 0,1,2,3 in each channel

    offset3 = clamp( offset0, 0.0, 1.0 );
    offset2 = clamp( offset0-1.0, 0.0, 1.0 );
    offset1 = clamp( offset0-2.0, 0.0, 1.0 );
  }


  /*
   * 2D classic Perlin noise. Fast, but less useful than 3D noise.
   */
  shared float noise(vec2 P)
  {
    vec2 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled and offset for texture lookup
    vec2 Pf = fract(P);             // Fractional part for interpolation

    // Noise contribution from lower left corner
    vec2 grad00 = texture2D(gradTexture, Pi).rg * 4.0 - 2.0;
    float n00 = dot(grad00, Pf);

    // Noise contribution from lower right corner
    vec2 grad10 = texture2D(gradTexture, Pi + vec2(ONE, 0.0)).rg * 4.0 - 2.0;
    float n10 = dot(grad10, Pf - vec2(1.0, 0.0));

    // Noise contribution from upper left corner
    vec2 grad01 = texture2D(gradTexture, Pi + vec2(0.0, ONE)).rg * 4.0 - 2.0;
    float n01 = dot(grad01, Pf - vec2(0.0, 1.0));

    // Noise contribution from upper right corner
    vec2 grad11 = texture2D(gradTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 2.0;
    float n11 = dot(grad11, Pf - vec2(1.0, 1.0));

    // Blend contributions along x
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade(Pf.x));

    // Blend contributions along y
    float n_xy = mix(n_x.x, n_x.y, fade(Pf.y));

    // We're done, return the final noise value.
    return 1.7 * n_xy;
  }


  /*
   * 3D classic noise. Slower, but a lot more useful than 2D noise.
   */
  shared float noise(vec3 P)
  {
    vec3 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel
                                    // and offset 1/2 texel to sample texel centers
    vec3 Pf = fract(P);     // Fractional part for interpolation

    // Noise contributions from (x=0, y=0), z=0 and z=1
    float perm00 = texture2D(gradTexture, Pi.xy).a ;
    vec3  grad000 = texture2D(gradTexture, vec2(perm00, Pi.z)).rgb * 4.0 - 2.0;
    grad000.z = floor(grad000.z); // Remove small variations due to w
    float n000 = dot(grad000, Pf);
    vec3  grad001 = texture2D(gradTexture, vec2(perm00, Pi.z + ONE)).rgb * 4.0 - 2.0;
    grad001.z = floor(grad001.z); // Remove small variations due to w
    float n001 = dot(grad001, Pf - vec3(0.0, 0.0, 1.0));

    // Noise contributions from (x=0, y=1), z=0 and z=1
    float perm01 = texture2D(gradTexture, Pi.xy + vec2(0.0, ONE)).a ;
    vec3  grad010 = texture2D(gradTexture, vec2(perm01, Pi.z)).rgb * 4.0 - 2.0;
    grad010.z = floor(grad010.z); // Remove small variations due to w
    float n010 = dot(grad010, Pf - vec3(0.0, 1.0, 0.0));
    vec3  grad011 = texture2D(gradTexture, vec2(perm01, Pi.z + ONE)).rgb * 4.0 - 2.0;
    grad011.z = floor(grad011.z); // Remove small variations due to w
    float n011 = dot(grad011, Pf - vec3(0.0, 1.0, 1.0));

    // Noise contributions from (x=1, y=0), z=0 and z=1
    float perm10 = texture2D(gradTexture, Pi.xy + vec2(ONE, 0.0)).a ;
    vec3  grad100 = texture2D(gradTexture, vec2(perm10, Pi.z)).rgb * 4.0 - 2.0;
    grad100.z = floor(grad100.z); // Remove small variations due to w
    float n100 = dot(grad100, Pf - vec3(1.0, 0.0, 0.0));
    vec3  grad101 = texture2D(gradTexture, vec2(perm10, Pi.z + ONE)).rgb * 4.0 - 2.0;
    grad101.z = floor(grad101.z); // Remove small variations due to w
    float n101 = dot(grad101, Pf - vec3(1.0, 0.0, 1.0));

    // Noise contributions from (x=1, y=1), z=0 and z=1
    float perm11 = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a ;
    vec3  grad110 = texture2D(gradTexture, vec2(perm11, Pi.z)).rgb * 4.0 - 2.0;
    grad110.z = floor(grad110.z); // Remove small variations due to w
    float n110 = dot(grad110, Pf - vec3(1.0, 1.0, 0.0));
    vec3  grad111 = texture2D(gradTexture, vec2(perm11, Pi.z + ONE)).rgb * 4.0 - 2.0;
    grad111.z = floor(grad111.z); // Remove small variations due to w
    float n111 = dot(grad111, Pf - vec3(1.0, 1.0, 1.0));

    // Blend contributions along x
    vec4 n_x = mix(vec4(n000, n001, n010, n011),
                   vec4(n100, n101, n110, n111), fade(Pf.x));

    // Blend contributions along y
    vec2 n_xy = mix(n_x.xy, n_x.zw, fade(Pf.y));

    // Blend contributions along z
    float n_xyz = mix(n_xy.x, n_xy.y, fade(Pf.z));

    // We're done, return the final noise value.
    return n_xyz;
  }


  /*
   * 4D classic noise. Slow, but very useful. 4D simplex noise is a lot faster.
   *
   * This function performs 8 texture lookups and 16 dependent texture lookups,
   * 16 dot products, 4 mix operations and a lot of additions and multiplications.
   * Needless to say, it's not super fast. But it's not dead slow either.
   */
  shared float noise(vec4 P)
  {
    vec4 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel
                                    // and offset 1/2 texel to sample texel centers
    vec4 Pf = fract(P);      // Fractional part for interpolation

    // "n0000" is the noise contribution from (x=0, y=0, z=0, w=0), and so on
    float perm00xy = texture2D(gradTexture, Pi.xy).a ;
    float perm00zw = texture2D(gradTexture, Pi.zw).a ;
    vec4 grad0000 = texture2D(gradTexture, vec2(perm00xy, perm00zw)).rgbb * 4.0 - 2.0;
    grad0000.z = floor(grad0000.z); // Remove slight variation from w
    grad0000.w = fract(grad0000.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0000 = dot(grad0000, Pf);

    float perm01zw = texture2D(gradTexture, Pi.zw  + vec2(0.0, ONE)).a ;
    vec4 grad0001 = texture2D(gradTexture, vec2(perm00xy, perm01zw)).rgbb * 4.0 - 2.0;
    grad0001.z = floor(grad0001.z); // Remove slight variation from w
    grad0001.w = fract(grad0001.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0001 = dot(grad0001, Pf - vec4(0.0, 0.0, 0.0, 1.0));

    float perm10zw = texture2D(gradTexture, Pi.zw  + vec2(ONE, 0.0)).a ;
    vec4 grad0010 = texture2D(gradTexture, vec2(perm00xy, perm10zw)).rgbb * 4.0 - 2.0;
    grad0010.z = floor(grad0010.z); // Remove slight variation from w
    grad0010.w = fract(grad0010.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0010 = dot(grad0010, Pf - vec4(0.0, 0.0, 1.0, 0.0));

    float perm11zw = texture2D(gradTexture, Pi.zw  + vec2(ONE, ONE)).a ;
    vec4 grad0011 = texture2D(gradTexture, vec2(perm00xy, perm11zw)).rgbb * 4.0 - 2.0;
    grad0011.z = floor(grad0011.z); // Remove slight variation from w
    grad0011.w = fract(grad0011.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0011 = dot(grad0011, Pf - vec4(0.0, 0.0, 1.0, 1.0));

    float perm01xy = texture2D(gradTexture, Pi.xy + vec2(0.0, ONE)).a ;
    vec4 grad0100 = texture2D(gradTexture, vec2(perm01xy, perm00zw)).rgbb * 4.0 - 2.0;
    grad0100.z = floor(grad0100.z); // Remove slight variation from w
    grad0100.w = fract(grad0100.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0100 = dot(grad0100, Pf - vec4(0.0, 1.0, 0.0, 0.0));

    vec4 grad0101 = texture2D(gradTexture, vec2(perm01xy, perm01zw)).rgbb * 4.0 - 2.0;
    grad0101.z = floor(grad0101.z); // Remove slight variation from w
    grad0101.w = fract(grad0101.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0101 = dot(grad0101, Pf - vec4(0.0, 1.0, 0.0, 1.0));

    vec4 grad0110 = texture2D(gradTexture, vec2(perm01xy, perm10zw)).rgbb * 4.0 - 2.0;
    grad0110.z = floor(grad0110.z); // Remove slight variation from w
    grad0110.w = fract(grad0110.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0110 = dot(grad0110, Pf - vec4(0.0, 1.0, 1.0, 0.0));

    vec4  grad0111 = texture2D(gradTexture, vec2(perm01xy, perm11zw)).rgbb * 4.0 - 2.0;
    grad0111.z = floor(grad0111.z); // Remove slight variation from w
    grad0111.w = fract(grad0111.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n0111 = dot(grad0111, Pf - vec4(0.0, 1.0, 1.0, 1.0));

    float perm10xy = texture2D(gradTexture, Pi.xy + vec2(ONE, 0.0)).a ;
    vec4  grad1000 = texture2D(gradTexture, vec2(perm10xy, perm00zw)).rgbb * 4.0 - 2.0;
    grad1000.z = floor(grad1000.z); // Remove slight variation from w
    grad1000.w = fract(grad1000.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1000 = dot(grad1000, Pf - vec4(1.0, 0.0, 0.0, 0.0));

    vec4  grad1001 = texture2D(gradTexture, vec2(perm10xy, perm01zw)).rgbb * 4.0 - 2.0;
    grad1001.z = floor(grad1001.z); // Remove slight variation from w
    grad1001.w = fract(grad1001.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1001 = dot(grad1001, Pf - vec4(1.0, 0.0, 0.0, 1.0));

    vec4  grad1010 = texture2D(gradTexture, vec2(perm10xy, perm10zw)).rgbb * 4.0 - 2.0;
    grad1010.z = floor(grad1010.z); // Remove slight variation from w
    grad1010.w = fract(grad1010.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1010 = dot(grad1010, Pf - vec4(1.0, 0.0, 1.0, 0.0));

    vec4  grad1011 = texture2D(gradTexture, vec2(perm10xy, perm11zw)).rgbb * 4.0 - 2.0;
    grad1011.z = floor(grad1011.z); // Remove slight variation from w
    grad1011.w = fract(grad1011.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1011 = dot(grad1011, Pf - vec4(1.0, 0.0, 1.0, 1.0));

    float perm11xy = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a ;
    vec4  grad1100 = texture2D(gradTexture, vec2(perm11xy, perm00zw)).rgbb * 4.0 - 2.0;
    grad1100.z = floor(grad1100.z); // Remove slight variation from w
    grad1100.w = fract(grad1100.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1100 = dot(grad1100, Pf - vec4(1.0, 1.0, 0.0, 0.0));

    vec4  grad1101 = texture2D(gradTexture, vec2(perm11xy, perm01zw)).rgbb * 4.0 - 2.0;
    grad1101.z = floor(grad1101.z); // Remove slight variation from w
    grad1101.w = fract(grad1101.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1101 = dot(grad1101, Pf - vec4(1.0, 1.0, 0.0, 1.0));

    vec4  grad1110 = texture2D(gradTexture, vec2(perm11xy, perm10zw)).rgbb * 4.0 - 2.0;
    grad1110.z = floor(grad1110.z); // Remove slight variation from w
    grad1110.w = fract(grad1110.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1110 = dot(grad1110, Pf - vec4(1.0, 1.0, 1.0, 0.0));

    vec4  grad1111 = texture2D(gradTexture, vec2(perm11xy, perm11zw)).rgbb * 4.0 - 2.0;
    grad1111.z = floor(grad1111.z); // Remove slight variation from w
    grad1111.w = fract(grad1111.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float n1111 = dot(grad1111, Pf - vec4(1.0, 1.0, 1.0, 1.0));

    // Blend contributions along x
    float fadex = fade(Pf.x);
    vec4 n_x0 = mix(vec4(n0000, n0001, n0010, n0011),
                    vec4(n1000, n1001, n1010, n1011), fadex);
    vec4 n_x1 = mix(vec4(n0100, n0101, n0110, n0111),
                    vec4(n1100, n1101, n1110, n1111), fadex);

    // Blend contributions along y
    vec4 n_xy = mix(n_x0, n_x1, fade(Pf.y));

    // Blend contributions along z
    vec2 n_xyz = mix(n_xy.xy, n_xy.zw, fade(Pf.z));

    // Blend contributions along w
    float n_xyzw = mix(n_xyz.x, n_xyz.y, fade(Pf.w));

    // We're done, return the final noise value.
    return n_xyzw;
  }


  /*
   * 2D simplex noise. Somewhat slower but much better looking than classic noise.
   */
  shared float snoise(vec2 P) {

  // Skew and unskew factors are a bit hairy for 2D, so define them as constants
  // This is (sqrt(3.0)-1.0)/2.0
  #define F2 0.366025403784
  // This is (3.0-sqrt(3.0))/6.0
  #define G2 0.211324865405

    // Skew the (x,y) space to determine which cell of 2 simplices we're in
   	float s = (P.x + P.y) * F2;   // Hairy factor for 2D skewing
    vec2 Pi = floor(P + s);
    float t = (Pi.x + Pi.y) * G2; // Hairy factor for unskewing
    vec2 P0 = Pi - t; // Unskew the cell origin back to (x,y) space
    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup

    vec2 Pf0 = P - P0;  // The x,y distances from the cell origin

    // For the 2D case, the simplex shape is an equilateral triangle.
    // Find out whether we are above or below the x=y diagonal to
    // determine which of the two triangles we're in.
    vec2 o1;
    if(Pf0.x > Pf0.y) o1 = vec2(1.0, 0.0);  // +x, +y traversal order
    else o1 = vec2(0.0, 1.0);               // +y, +x traversal order

    // Noise contribution from simplex origin
    vec2 grad0 = texture2D(gradTexture, Pi).rg * 4.0 - 2.0;
    float t0 = 0.5 - dot(Pf0, Pf0);
    float n0;
    if (t0 < 0.0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad0, Pf0);
    }

    // Noise contribution from middle corner
    vec2 Pf1 = Pf0 - o1 + G2;
    vec2 grad1 = texture2D(gradTexture, Pi + o1*ONE).rg * 4.0 - 2.0;
    float t1 = 0.5 - dot(Pf1, Pf1);
    float n1;
    if (t1 < 0.0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad1, Pf1);
    }
  
    // Noise contribution from last corner
    vec2 Pf2 = Pf0 - vec2(1.0-2.0*G2);
    vec2 grad2 = texture2D(gradTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 2.0;
    float t2 = 0.5 - dot(Pf2, Pf2);
    float n2;
    if(t2 < 0.0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad2, Pf2);
    }

    // Sum up and scale the result to cover the range [-1,1]
    return 100.0 * (n0 + n1 + n2);
  }


  /*
   * 3D simplex noise. Comparable in speed to classic noise, better looking.
   */
  shared float snoise(vec3 P) {

  // The skewing and unskewing factors are much simpler for the 3D case
  #define F3 0.333333333333
  #define G3 0.166666666667

    // Skew the (x,y,z) space to determine which cell of 6 simplices we're in
   	float s = (P.x + P.y + P.z) * F3; // Factor for 3D skewing
    vec3 Pi = floor(P + s);
    float t = (Pi.x + Pi.y + Pi.z) * G3;
    vec3 P0 = Pi - t; // Unskew the cell origin back to (x,y,z) space
    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup

    vec3 Pf0 = P - P0;  // The x,y distances from the cell origin

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // To find out which of the six possible tetrahedra we're in, we need to
    // determine the magnitude ordering of x, y and z components of Pf0.
    vec3 o1;
    vec3 o2;
    simplex(Pf0, o1, o2);

    // Noise contribution from simplex origin
    float perm0 = texture2D(gradTexture, Pi.xy).a;
    vec3  grad0 = texture2D(gradTexture, vec2(perm0, Pi.z)).rgb * 4.0 - 2.0;
    grad0.z = floor(grad0.z); // Remove small variations due to w
    float t0 = 0.6 - dot(Pf0, Pf0);
    float n0;
    if (t0 < 0.0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad0, Pf0);
    }

    // Noise contribution from second corner
    vec3 Pf1 = Pf0 - o1 + G3;
    float perm1 = texture2D(gradTexture, Pi.xy + o1.xy*ONE).a;
    vec3  grad1 = texture2D(gradTexture, vec2(perm1, Pi.z + o1.z*ONE)).rgb * 4.0 - 2.0;
    grad1.z = floor(grad1.z); // Remove small variations due to w
    float t1 = 0.6 - dot(Pf1, Pf1);
    float n1;
    if (t1 < 0.0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad1, Pf1);
    }
  
    // Noise contribution from third corner
    vec3 Pf2 = Pf0 - o2 + 2.0 * G3;
    float perm2 = texture2D(gradTexture, Pi.xy + o2.xy*ONE).a;
    vec3  grad2 = texture2D(gradTexture, vec2(perm2, Pi.z + o2.z*ONE)).rgb * 4.0 - 2.0;
    grad2.z = floor(grad2.z); // Remove small variations due to w
    float t2 = 0.6 - dot(Pf2, Pf2);
    float n2;
    if (t2 < 0.0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad2, Pf2);
    }
  
    // Noise contribution from last corner
    vec3 Pf3 = Pf0 - vec3(1.0-3.0*G3);
    float perm3 = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a;
    vec3  grad3 = texture2D(gradTexture, vec2(perm3, Pi.z + ONE)).rgb * 4.0 - 2.0;
    grad3.z = floor(grad3.z); // Remove small variations due to w
    float t3 = 0.6 - dot(Pf3, Pf3);
    float n3;
    if(t3 < 0.0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * dot(grad3, Pf3);
    }

    // Sum up and scale the result to cover the range [-1,1]
    return 20.0 * (n0 + n1 + n2 + n3);
  }


  /*
   * 4D simplex noise. A lot faster than classic 4D noise, and better looking.
   */

  shared float snoise(vec4 P) {

  // The skewing and unskewing factors are hairy again for the 4D case
  // This is (sqrt(5.0)-1.0)/4.0
  #define F4 0.309016994375
  // This is (5.0-sqrt(5.0))/20.0
  #define G4 0.138196601125

    // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
   	float s = (P.x + P.y + P.z + P.w) * F4; // Factor for 4D skewing
    vec4 Pi = floor(P + s);
    float t = (Pi.x + Pi.y + Pi.z + Pi.w) * G4;
    vec4 P0 = Pi - t; // Unskew the cell origin back to (x,y,z,w) space
    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup

    vec4 Pf0 = P - P0;  // The x,y distances from the cell origin

    // For the 4D case, the simplex is a 4D shape I won't even try to describe.
    // To find out which of the 24 possible simplices we're in, we need to
    // determine the magnitude ordering of x, y, z and w components of Pf0.
    vec4 o1;
    vec4 o2;
    vec4 o3;
    simplex(Pf0, o1, o2, o3);  

    // Noise contribution from simplex origin
    float perm0xy = texture2D(gradTexture, Pi.xy).a;
    float perm0zw = texture2D(gradTexture, Pi.zw).a;
    vec4 grad0 = texture2D(gradTexture, vec2(perm0xy, perm0zw)).rgbb * 4.0 - 2.0;
    grad0.z = floor(grad0.z); // Remove slight variation from w
    grad0.w = fract(grad0.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float t0 = 0.6 - dot(Pf0, Pf0);
    float n0;
    if (t0 < 0.0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad0, Pf0);
    }

    // Noise contribution from second corner
    vec4 Pf1 = Pf0 - o1 + G4;
    o1 = o1 * ONE;
    float perm1xy = texture2D(gradTexture, Pi.xy + o1.xy).a;
    float perm1zw = texture2D(gradTexture, Pi.zw + o1.zw).a;
    vec4 grad1 = texture2D(gradTexture, vec2(perm1xy, perm1zw)).rgbb * 4.0 - 2.0;
    grad1.z = floor(grad1.z); // Remove slight variation from w
    grad1.w = fract(grad1.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float t1 = 0.6 - dot(Pf1, Pf1);
    float n1;
    if (t1 < 0.0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad1, Pf1);
    }
  
    // Noise contribution from third corner
    vec4 Pf2 = Pf0 - o2 + 2.0 * G4;
    o2 = o2 * ONE;
    float perm2xy = texture2D(gradTexture, Pi.xy + o2.xy).a;
    float perm2zw = texture2D(gradTexture, Pi.zw + o2.zw).a;
    vec4 grad2 = texture2D(gradTexture, vec2(perm2xy, perm2zw)).rgbb * 4.0 - 2.0;
    grad2.z = floor(grad2.z); // Remove slight variation from w
    grad2.w = fract(grad2.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float t2 = 0.6 - dot(Pf2, Pf2);
    float n2;
    if (t2 < 0.0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad2, Pf2);
    }
  
    // Noise contribution from fourth corner
    vec4 Pf3 = Pf0 - o3 + 3.0 * G4;
    o3 = o3 * ONE;
    float perm3xy = texture2D(gradTexture, Pi.xy + o3.xy).a;
    float perm3zw = texture2D(gradTexture, Pi.zw + o3.zw).a;
    vec4 grad3 = texture2D(gradTexture, vec2(perm3xy, perm3zw)).rgbb * 4.0 - 2.0;
    grad3.z = floor(grad3.z); // Remove slight variation from w
    grad3.w = fract(grad3.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float t3 = 0.6 - dot(Pf3, Pf3);
    float n3;
    if (t3 < 0.0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * dot(grad3, Pf3);
    }
  
    // Noise contribution from last corner
    vec4 Pf4 = Pf0 - vec4(1.0-4.0*G4);
    float perm4xy = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a;
    float perm4zw = texture2D(gradTexture, Pi.zw + vec2(ONE, ONE)).a;
    vec4  grad4 = texture2D(gradTexture, vec2(perm4xy, perm4zw)).rgbb * 4.0 - 2.0;
    grad4.z = floor(grad4.z); // Remove slight variation from w
    grad4.w = fract(grad4.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding
    float t4 = 0.6 - dot(Pf4, Pf4);
    float n4;
    if(t4 < 0.0) n4 = 0.0;
    else {
      t4 *= t4;
      n4 = t4 * t4 * dot(grad4, Pf4);
    }

    // Sum up and scale the result to cover the range [-1,1]
    return 27.0 * (n0 + n1 + n2 + n3 + n4);
  }


<%
} else {
// non-texture-based implementation:
// Ian McEwan, Ashima Arts.
// Copyright (C) 2011 Ashima Arts. All rights reserved.
// Distributed under the MIT License. See LICENSE file.
%>

shared vec4 permute(vec4 x)
{
  return mod(((x*34.0)+1.0)*x, 289.0);
}

shared vec3 permute(vec3 x)
{
  return mod(((x*34.0)+1.0)*x, 289.0);
}

shared float permute(float x)
{
  return floor(mod(((x*34.0)+1.0)*x, 289.0));
}

shared vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

shared float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

shared vec4 grad4(float j, vec4 ip)
{
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
}

shared vec4 fade(vec4 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

shared vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

shared vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
shared float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// Classic Perlin noise, periodic variant
shared float pnoise(vec2 P, vec2 rep)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// Classic Perlin noise
shared float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Classic Perlin noise, periodic variant
shared float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Classic Perlin noise
shared float cnoise(vec4 P)
{
  vec4 Pi0 = floor(P); // Integer part for indexing
  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec4 Pf0 = fract(P); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}

// Classic Perlin noise, periodic version
shared float cnoise(vec4 P, vec4 rep)
{
  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep
  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep
  vec4 Pf0 = fract(P); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}

shared float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626, // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod(i, 289.0); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Inlined for speed: m *= taylorInvSqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

shared float snoise(vec3 v)
{
  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  // x0 = x0 - 0.0 + 0.0 * C.xxx;
  // x1 = x0 - i1 + 1.0 * C.xxx;
  // x2 = x0 - i2 + 2.0 * C.xxx;
  // x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy; // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

shared float snoise(vec4 v)
{
  const vec4 C = vec4( 0.138196601125011, // (5 - sqrt(5))/20 G4
                        0.276393202250021, // 2 * G4
                        0.414589803375032, // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

  // (sqrt(5) - 1)/4 = F4, used once below
  #define F4 0.309016994374947451

// First corner
  vec4 i = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v - i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
// i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
// i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  // x0 = x0 - 0.0 + 0.0 * C.xxxx
  // x1 = x0 - i1 + 0.0 * C.xxxx
  // x2 = x0 - i2 + 0.0 * C.xxxx
  // x3 = x0 - i3 + 0.0 * C.xxxx
  // x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

  // Permutations
  i = mod(i, 289.0);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

  // Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4) ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

<% } %>
