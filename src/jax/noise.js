/**
 * class Jax.Noise
 * Constructs several textures to be used in vertex shaders involving Perlin noise.
 * As of v1.1.0, Jax defines a global variable called **Jax.noise** that you can use
 * instead of maintaining your own instance of Jax.Noise. This is both more memory
 * efficient and easier to use.
 *
 * Example:
 *
 *     setUniforms: function($super, context, mesh, options, uniforms) {
 *       $super(context, mesh, options, uniforms);
 *       
 *       Jax.noise.bind(context, uniforms);
 *       
 *       // . . .
 *     }
 *
 **/
Jax.Noise = (function() {
  var perm/*[256]*/ = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

  /* These are Ken Perlin's proposed gradients for 3D noise. I kept them for
     better consistency with the reference implementation, but there is really
     no need to pad this to 16 gradients for this particular implementation.
     If only the "proper" first 12 gradients are used, they can be extracted
     from the grad4[][] array: grad3[i][j] == grad4[i*2][j], 0<=i<=11, j=0,1,2
  */
  var grad3/*[16][3]*/ = [0,1,1,    0,1,-1,   0,-1,1,   0,-1,-1,
                          1,0,1,    1,0,-1,  -1,0,1,   -1,0,-1,
                          1,1,0,    1,-1,0,  -1,1,0,   -1,-1,0, // 12 cube edges
                          1,0,-1,  -1,0,-1,   0,-1,1,   0,1,1]; // 4 more to make 16

  /* These are my own proposed gradients for 4D noise. They are the coordinates
     of the midpoints of each of the 32 edges of a tesseract, just like the 3D
     noise gradients are the midpoints of the 12 edges of a cube.
  */
  var grad4/*[32][4]*/ = [0,1,1,1,   0,1,1,-1,   0,1,-1,1,   0,1,-1,-1, // 32 tesseract edges
                          0,-1,1,1,  0,-1,1,-1,  0,-1,-1,1,  0,-1,-1,-1,
                          1,0,1,1,   1,0,1,-1,   1,0,-1,1,   1,0,-1,-1,
                         -1,0,1,1,  -1,0,1,-1,  -1,0,-1,1,  -1,0,-1,-1,
                          1,1,0,1,   1,1,0,-1,   1,-1,0,1,   1,-1,0,-1,
                         -1,1,0,1,  -1,1,0,-1,  -1,-1,0,1,  -1,-1,0,-1,
                          1,1,1,0,   1,1,-1,0,   1,-1,1,0,   1,-1,-1,0,
                         -1,1,1,0,  -1,1,-1,0,  -1,-1,1,0,  -1,-1,-1,0];

  /* This is a look-up table to speed up the decision on which simplex we
     are in inside a cube or hypercube "cell" for 3D and 4D simplex noise.
     It is used to avoid complicated nested conditionals in the GLSL code.
     The table is indexed in GLSL with the results of six pair-wise
     comparisons beween the components of the P=(x,y,z,w) coordinates
     within a hypercube cell.
     c1 = x>=y ? 32 : 0;
     c2 = x>=z ? 16 : 0;
     c3 = y>=z ? 8 : 0;
     c4 = x>=w ? 4 : 0;
     c5 = y>=w ? 2 : 0;
     c6 = z>=w ? 1 : 0;
     offsets = simplex[c1+c2+c3+c4+c5+c6];
     o1 = step(160,offsets);
     o2 = step(96,offsets);
     o3 = step(32,offsets);
     (For the 3D case, c4, c5, c6 and o3 are not needed.)
  */
    var simplex4/*[][4]*/ = [0,64,128,192,   0,64,192,128,   0,0,0,0,        0,128,192,64,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        64,128,192,0,
                             0,128,64,192,   0,0,0,0,        0,192,64,128,   0,192,128,64,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        64,192,128,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             64,128,0,192,   0,0,0,0,        64,192,0,128,   0,0,0,0,
                             0,0,0,0,        0,0,0,0,        128,192,0,64,   128,192,64,0,
                             64,0,128,192,   64,0,192,128,   0,0,0,0,        0,0,0,0,
                             0,0,0,0,        128,0,192,64,   0,0,0,0,        128,64,192,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             128,0,64,192,   0,0,0,0,        0,0,0,0,        0,0,0,0,
                             192,0,64,128,   192,0,128,64,   0,0,0,0,        192,64,128,0,
                             128,64,0,192,   0,0,0,0,        0,0,0,0,        0,0,0,0,
                             192,64,0,128,   0,0,0,0,        192,128,0,64,   192,128,64,0];
                             
  var simplex_buf = null, perm_buf = null, grad_buf = null;
  
  /*
   * initPermTexture() - create and load a 2D texture for
   * a combined index permutation and gradient lookup table.
   * This texture is used for 2D and 3D noise, both classic and simplex.
   */
  function initPermTexture(context)
  {
    var tex = new Jax.Texture({min_filter: GL_NEAREST, mag_filter: GL_NEAREST, width:256, height:256});
    
    if (!perm_buf) {
      var pixels = new Array(256*256*4);
      var i,j;
      for(i = 0; i<256; i++)
        for(j = 0; j<256; j++) {
          var offset = (i*256+j)*4;
          var value = perm[(j+perm[i]) & 0xFF];
          var g = (value & 0x0F) * 3;
          pixels[offset]   = grad3[g+0] * 64 + 64; // Gradient x
          pixels[offset+1] = grad3[g+1] * 64 + 64; // Gradient y
          pixels[offset+2] = grad3[g+2] * 64 + 64; // Gradient z
          pixels[offset+3] = value;                // Permuted index
        }
      perm_buf = new Uint8Array(pixels);
    }

    return tex;
  }
  
  /*
   * initSimplexTexture() - create and load a 1D texture for a
   * simplex traversal order lookup table. This is used for simplex noise only,
   * and only for 3D and 4D noise where there are more than 2 simplices.
   * (3D simplex noise has 6 cases to sort out, 4D simplex noise has 24 cases.)
   */
  function initSimplexTexture(context)
  {
    // webgl doesn't support 1D so we'll simulate it with a 64x1 texture

    if (!simplex_buf) simplex_buf = new Uint8Array(simplex4);
    var tex = new Jax.Texture({min_filter:GL_NEAREST,mag_filter:GL_NEAREST, width:64, height:1});
    return tex;
  }
  
  /*
   * initGradTexture(context) - create and load a 2D texture
   * for a 4D gradient lookup table. This is used for 4D noise only.
   */
  function initGradTexture(context)
  {
    var tex = new Jax.Texture({min_filter: GL_NEAREST, mag_filter: GL_NEAREST, width:256, height:256});

    if (!grad_buf) {
      var pixels = new Array(256*256*4);
      var i,j;

      for(i = 0; i<256; i++)
        for(j = 0; j<256; j++) {
          var offset = (i*256+j)*4;
          var value = perm[(j+perm[i]) & 0xFF];
          var g = (value & 0x1F) * 4;
          pixels[offset]   = grad4[g+0] * 64 + 64; // Gradient x
          pixels[offset+1] = grad4[g+1] * 64 + 64; // Gradient y
          pixels[offset+2] = grad4[g+2] * 64 + 64; // Gradient z
          pixels[offset+3] = grad4[g+3] * 64 + 64; // Gradient z
        }
      
      grad_buf = new Uint8Array(pixels);
    }

    return tex;
  }
  
  function prepareAll(self, context) {
    if (!perm_buf || !simplex_buf || !grad_buf)
      throw new Error("Unknown error: one of the noise buffers is null!");
      
    self.perm.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, perm_buf);
    });
    self.simplex.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 64, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, simplex_buf);
    });
    self.grad.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, grad_buf);
    });
  }

  return Jax.Class.create({
    initialize: function(context) {
      /** 
       * Jax.Noise#perm -> Jax.Texture
       * A 2D texture for a combined index permutation and gradient lookup table.
       * This texture is used for both 2D and 3D noise, both classic and simplex.
       **/
      this.perm = initPermTexture(context);
      
      /** 
       * Jax.Noise#simplex -> Jax.Texture
       * A 1D texture for a simplex transversal order lookup table. This is used
       * for simplex noise only, and only for 3D and 4D noise where there are more
       * than 2 simplices. (3D simplex noise has 6 cases to sort out, 4D simplex
       * noise has 24 cases.)
       *
       * Note that WebGL does not support 1D textures, so this is technically a
       * 2D texture with a height of 1 pixel.
       **/
      this.simplex = initSimplexTexture(context);
      
      /** 
       * Jax.Noise#grad -> Jax.Texture
       * A 2D texture for a 4D gradient lookup table. This is used for 4D noise
       * only.
       **/
      this.grad = initGradTexture(context);
      
      if (context) prepareAll(this, context);
    },
    
    /**
     * Jax.Noise#bind(context, uniforms) -> Jax.Shader.Delegator
     * - context (Jax.Context): the context to bind the noise textures to
     * - uniforms (Jax.Shader.Delegator): the shader variables to bind this noise to.
     * 
     * Binds the three noise textures to the given set of shader uniforms. This is
     * intended to be used from within a shader's +material.js+ file like so:
     *
     *     setUniforms: function($super, context, mesh, options, uniforms) {
     *       $super(context, mesh, options, uniforms);
     *       
     *       Jax.noise.bind(context, uniforms);
     *       
     *       // . . .
     *     }
     *
     * Returns the same uniforms delegator that was specified to begin with.
     *
     **/
    bind: function(context, uniforms) {
      if (!this.isPrepared(context)) prepareAll(this, context);
      uniforms.texture('permTexture',    this.perm,    context);
      uniforms.texture('simplexTexture', this.simplex, context);
      uniforms.texture('gradTexture',    this.grad,    context);
    },
    
    /**
     * Jax.Noise#isPrepared(context) -> Boolean
     * 
     * Returns true if this Jax.Noise has had its textures prepared for the
     * specified context.
     **/
    isPrepared: function(context) {
      return this.perm.isValid(context);
    }
  });
})();

Jax.noise = new Jax.Noise();
