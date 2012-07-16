#= require 'jax/core/texture'

# class Jax.Noise
# Constructs several textures to be used in vertex shaders involving Perlin noise.
# As of v1.1.0, Jax defines a global variable called **Jax.noise** that you can use
# instead of maintaining your own instance of +Jax.Noise+. This is both more memory
# efficient and easier to use.
#
# Example:
#
#     setUniforms: (context, mesh, options, uniforms) ->
#       Jax.noise.bind context, uniforms
#       # . . .
#
class Jax.Noise
  perm = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 
          225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 
          148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 
          11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 
          168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231,
          83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 
          40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 
          132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 
          164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 
          202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 
          58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 
          154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 
          19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 
          97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 
          81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 
          106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 
          138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 
          66, 215, 61, 156, 180]
    
  # Gradients for 4D noise. They are the coordinates of the midpoints of each
  # of the 32 edges of a tesseract, just like Perlin's originally proposed
  # 3D noise gradients are the midpoints of the 12 edges of a cube.
  # The 3D gradients are the first three components of these, which means
  # that the eight corners of the 3D cube are included as well. This differs
  # from Perlin's implementation and gives gradients of two different 
  # magnitudes.
  # The 2D gradients are the first two components of these, which yields
  # the four edges and the four corners of the unit square, again two
  # different magnitudes. If this is a problem, you can split 2D, 3D and 4D
  # to use different textures, at the expense of complexity and using more
  # texture units if you mix 2D, 3D and 4D noise in the same shader.
  
  # 32 tesseract edges
  grad = [[0, 1, 1, 1],   [0, 1, 1,-1],   [0, 1,-1, 1],   [0, 1,-1,-1],
          [0,-1, 1, 1],  [0,-1, 1,-1],  [0,-1,-1, 1],  [0,-1,-1,-1], 
          [1, 0, 1, 1],   [1, 0, 1,-1],   [1, 0,-1, 1],   [1, 0,-1,-1], 
          [-1, 0, 1, 1],  [-1, 0, 1,-1],  [-1, 0,-1, 1],  [-1, 0,-1,-1], 
          [1, 1, 0, 1],   [1, 1, 0,-1],   [1,-1, 0, 1],   [1,-1, 0,-1], 
          [-1, 1, 0, 1],  [-1, 1, 0,-1],  [-1,-1, 0, 1],  [-1,-1, 0,-1], 
          [1, 1, 1, 0],   [1, 1,-1, 0],   [1,-1, 1, 0],   [1,-1,-1, 0], 
          [-1, 1, 1, 0],  [-1, 1,-1, 0],  [-1,-1, 1, 0],  [-1,-1,-1, 0]]
  grad_buf = null

  # initGradTexture(context) - create and load a 2D texture
  # for a 4D gradient lookup table. This is used for 4D noise only.
  initGradTexture = ->
    tex = new Jax.Texture
      min_filter: GL_NEAREST
      mag_filter: GL_NEAREST
      width:256
      height:256

    unless grad_buf
      pixels = new Array 256*256*4
      for i in [0...256]
        for j in [0...256]
          offset = (i*256+j) * 4
          value = perm[(j+perm[i]) & 0xFF]
          gv = value & 0x0F
          # Gradient x, y, z, w
          pixels[offset  ] = grad[gv][0] * 64 + 128
          pixels[offset+1] = grad[gv][1] * 64 + 128
          pixels[offset+2] = grad[gv][2] * 64 + grad[gv][3] * 16 + 128
          pixels[offset+3] = value # permuted index
      
      grad_buf = new Uint8Array pixels

    tex
  
  prepare: (context) ->
    @grad.bind context, ->
      context.gl.texImage2D GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, grad_buf
      
  constructor: (context = null) ->
    # Jax.Noise#grad -> Jax.Texture
    # A 2D texture for a combined index permutation and gradient lookup table.
    # This texture is used for 2D, 3D and 4D noise, both classic and simplex.
    @grad = initGradTexture()
    @prepare context if context
    
  # Jax.Noise#bind(context, uniforms) -> Jax.Shader.Delegator
  # - context (Jax.Context): the context to bind the noise textures to
  # - uniforms (Jax.Shader.Delegator): the shader variables to bind this noise
  #   to.
  # 
  # Binds the three noise textures to the given set of shader uniforms. This
  # is intended to be used from within a shader's +material.js+ file like so:
  #
  #     setUniforms: (context, mesh, options, uniforms) ->
  #       Jax.noise.bind context, uniforms
  #       # . . .
  #
  # Returns the same uniforms delegator that was specified to begin with.
  bind: (context, uniforms) ->
    @prepare context unless @isPrepared context
    uniforms.gradTexture = @grad
    
  # Jax.Noise#isPrepared(context) -> Boolean
  #
  # Returns true if this Jax.Noise has had its textures prepared for the
  # specified context.
  isPrepared: (context) ->
    @grad.isValid context

Jax.noise = new Jax.Noise
