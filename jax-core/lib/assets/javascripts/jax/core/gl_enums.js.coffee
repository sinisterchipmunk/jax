_global = Jax.getGlobal()

# ClearBufferMask
_global.GL_DEPTH_BUFFER_BIT               = 0x00000100
_global.GL_STENCIL_BUFFER_BIT             = 0x00000400
_global.GL_COLOR_BUFFER_BIT               = 0x00004000

# BeginMode
_global.GL_POINTS                         = 0x0000
_global.GL_LINES                          = 0x0001
_global.GL_LINE_LOOP                      = 0x0002
_global.GL_LINE_STRIP                     = 0x0003
_global.GL_TRIANGLES                      = 0x0004
_global.GL_TRIANGLE_STRIP                 = 0x0005
_global.GL_TRIANGLE_FAN                   = 0x0006

# AlphaFunction (not supported in ES20)
#      NEVER
#      LESS
#      EQUAL
#      LEQUAL
#      GREATER
#      NOTEQUAL
#      GEQUAL
#      ALWAYS

# BlendingFactorDest
_global.GL_ZERO                           = 0
_global.GL_ONE                            = 1
_global.GL_SRC_COLOR                      = 0x0300
_global.GL_ONE_MINUS_SRC_COLOR            = 0x0301
_global.GL_SRC_ALPHA                      = 0x0302
_global.GL_ONE_MINUS_SRC_ALPHA            = 0x0303
_global.GL_DST_ALPHA                      = 0x0304
_global.GL_ONE_MINUS_DST_ALPHA            = 0x0305

# BlendingFactorSrc
#      ZERO
#      ONE
_global.GL_DST_COLOR                      = 0x0306
_global.GL_ONE_MINUS_DST_COLOR            = 0x0307
_global.GL_SRC_ALPHA_SATURATE             = 0x0308
#      SRC_ALPHA
#      ONE_MINUS_SRC_ALPHA
#      DST_ALPHA
#      ONE_MINUS_DST_ALPHA

# BlendEquationSeparate
_global.GL_FUNC_ADD                       = 0x8006
_global.GL_BLEND_EQUATION                 = 0x8009
_global.GL_BLEND_EQUATION_RGB             = 0x8009   # same as BLEND_EQUATION
_global.GL_BLEND_EQUATION_ALPHA           = 0x883D

# BlendSubtract
_global.GL_FUNC_SUBTRACT                  = 0x800A
_global.GL_FUNC_REVERSE_SUBTRACT          = 0x800B

# Separate Blend Functions
_global.GL_BLEND_DST_RGB                  = 0x80C8
_global.GL_BLEND_SRC_RGB                  = 0x80C9
_global.GL_BLEND_DST_ALPHA                = 0x80CA
_global.GL_BLEND_SRC_ALPHA                = 0x80CB
_global.GL_CONSTANT_COLOR                 = 0x8001
_global.GL_ONE_MINUS_CONSTANT_COLOR       = 0x8002
_global.GL_CONSTANT_ALPHA                 = 0x8003
_global.GL_ONE_MINUS_CONSTANT_ALPHA       = 0x8004
_global.GL_BLEND_COLOR                    = 0x8005

# Buffer Objects
_global.GL_ARRAY_BUFFER                   = 0x8892
_global.GL_ELEMENT_ARRAY_BUFFER           = 0x8893
_global.GL_ARRAY_BUFFER_BINDING           = 0x8894
_global.GL_ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895

_global.GL_STREAM_DRAW                    = 0x88E0
_global.GL_STATIC_DRAW                    = 0x88E4
_global.GL_DYNAMIC_DRAW                   = 0x88E8

_global.GL_BUFFER_SIZE                    = 0x8764
_global.GL_BUFFER_USAGE                   = 0x8765

_global.GL_CURRENT_VERTEX_ATTRIB          = 0x8626

# CullFaceMode
_global.GL_FRONT                          = 0x0404
_global.GL_BACK                           = 0x0405
_global.GL_FRONT_AND_BACK                 = 0x0408

# DepthFunction
#      NEVER
#      LESS
#      EQUAL
#      LEQUAL
#      GREATER
#      NOTEQUAL
#      GEQUAL
#      ALWAYS

# EnableCap
# TEXTURE_2D
_global.GL_CULL_FACE                      = 0x0B44
_global.GL_BLEND                          = 0x0BE2
_global.GL_DITHER                         = 0x0BD0
_global.GL_STENCIL_TEST                   = 0x0B90
_global.GL_DEPTH_TEST                     = 0x0B71
_global.GL_SCISSOR_TEST                   = 0x0C11
_global.GL_POLYGON_OFFSET_FILL            = 0x8037
_global.GL_SAMPLE_ALPHA_TO_COVERAGE       = 0x809E
_global.GL_SAMPLE_COVERAGE                = 0x80A0

# ErrorCode
_global.GL_NO_ERROR                       = 0
_global.GL_INVALID_ENUM                   = 0x0500
_global.GL_INVALID_VALUE                  = 0x0501
_global.GL_INVALID_OPERATION              = 0x0502
_global.GL_OUT_OF_MEMORY                  = 0x0505

# FrontFaceDirection
_global.GL_CW                             = 0x0900
_global.GL_CCW                            = 0x0901

# GetPName
_global.GL_LINE_WIDTH                     = 0x0B21
_global.GL_ALIASED_POINT_SIZE_RANGE       = 0x846D
_global.GL_ALIASED_LINE_WIDTH_RANGE       = 0x846E
_global.GL_CULL_FACE_MODE                 = 0x0B45
_global.GL_FRONT_FACE                     = 0x0B46
_global.GL_DEPTH_RANGE                    = 0x0B70
_global.GL_DEPTH_WRITEMASK                = 0x0B72
_global.GL_DEPTH_CLEAR_VALUE              = 0x0B73
_global.GL_DEPTH_FUNC                     = 0x0B74
_global.GL_STENCIL_CLEAR_VALUE            = 0x0B91
_global.GL_STENCIL_FUNC                   = 0x0B92
_global.GL_STENCIL_FAIL                   = 0x0B94
_global.GL_STENCIL_PASS_DEPTH_FAIL        = 0x0B95
_global.GL_STENCIL_PASS_DEPTH_PASS        = 0x0B96
_global.GL_STENCIL_REF                    = 0x0B97
_global.GL_STENCIL_VALUE_MASK             = 0x0B93
_global.GL_STENCIL_WRITEMASK              = 0x0B98
_global.GL_STENCIL_BACK_FUNC              = 0x8800
_global.GL_STENCIL_BACK_FAIL              = 0x8801
_global.GL_STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802
_global.GL_STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803
_global.GL_STENCIL_BACK_REF               = 0x8CA3
_global.GL_STENCIL_BACK_VALUE_MASK        = 0x8CA4
_global.GL_STENCIL_BACK_WRITEMASK         = 0x8CA5
_global.GL_VIEWPORT                       = 0x0BA2
_global.GL_SCISSOR_BOX                    = 0x0C10
#      SCISSOR_TEST
_global.GL_COLOR_CLEAR_VALUE              = 0x0C22
_global.GL_COLOR_WRITEMASK                = 0x0C23
_global.GL_UNPACK_ALIGNMENT               = 0x0CF5
_global.GL_PACK_ALIGNMENT                 = 0x0D05
_global.GL_MAX_TEXTURE_SIZE               = 0x0D33
_global.GL_MAX_VIEWPORT_DIMS              = 0x0D3A
_global.GL_SUBPIXEL_BITS                  = 0x0D50
_global.GL_RED_BITS                       = 0x0D52
_global.GL_GREEN_BITS                     = 0x0D53
_global.GL_BLUE_BITS                      = 0x0D54
_global.GL_ALPHA_BITS                     = 0x0D55
_global.GL_DEPTH_BITS                     = 0x0D56
_global.GL_STENCIL_BITS                   = 0x0D57
_global.GL_POLYGON_OFFSET_UNITS           = 0x2A00
#      POLYGON_OFFSET_FILL
_global.GL_POLYGON_OFFSET_FACTOR          = 0x8038
_global.GL_TEXTURE_BINDING_2D             = 0x8069
_global.GL_SAMPLE_BUFFERS                 = 0x80A8
_global.GL_SAMPLES                        = 0x80A9
_global.GL_SAMPLE_COVERAGE_VALUE          = 0x80AA
_global.GL_SAMPLE_COVERAGE_INVERT         = 0x80AB

# GetTextureParameter
#      TEXTURE_MAG_FILTER
#      TEXTURE_MIN_FILTER
#      TEXTURE_WRAP_S
#      TEXTURE_WRAP_T

_global.GL_COMPRESSED_TEXTURE_FORMATS     = 0x86A3

# HintMode
_global.GL_DONT_CARE                      = 0x1100
_global.GL_FASTEST                        = 0x1101
_global.GL_NICEST                         = 0x1102

# HintTarget
_global.GL_GENERATE_MIPMAP_HINT            = 0x8192

# DataType
_global.GL_BYTE                           = 0x1400
_global.GL_UNSIGNED_BYTE                  = 0x1401
_global.GL_SHORT                          = 0x1402
_global.GL_UNSIGNED_SHORT                 = 0x1403
_global.GL_INT                            = 0x1404
_global.GL_UNSIGNED_INT                   = 0x1405
_global.GL_FLOAT                          = 0x1406

# PixelFormat
_global.GL_DEPTH_COMPONENT                = 0x1902
_global.GL_ALPHA                          = 0x1906
_global.GL_RGB                            = 0x1907
_global.GL_RGBA                           = 0x1908
_global.GL_LUMINANCE                      = 0x1909
_global.GL_LUMINANCE_ALPHA                = 0x190A

# PixelType
#      UNSIGNED_BYTE
_global.GL_UNSIGNED_SHORT_4_4_4_4         = 0x8033
_global.GL_UNSIGNED_SHORT_5_5_5_1         = 0x8034
_global.GL_UNSIGNED_SHORT_5_6_5           = 0x8363

# Shaders
_global.GL_FRAGMENT_SHADER                  = 0x8B30
_global.GL_VERTEX_SHADER                    = 0x8B31
_global.GL_MAX_VERTEX_ATTRIBS               = 0x8869
_global.GL_MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB
_global.GL_MAX_VARYING_VECTORS              = 0x8DFC
_global.GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D
_global.GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C
_global.GL_MAX_TEXTURE_IMAGE_UNITS          = 0x8872
_global.GL_MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD
_global.GL_SHADER_TYPE                      = 0x8B4F
_global.GL_DELETE_STATUS                    = 0x8B80
_global.GL_LINK_STATUS                      = 0x8B82
_global.GL_VALIDATE_STATUS                  = 0x8B83
_global.GL_ATTACHED_SHADERS                 = 0x8B85
_global.GL_ACTIVE_UNIFORMS                  = 0x8B86
_global.GL_ACTIVE_ATTRIBUTES                = 0x8B89
_global.GL_SHADING_LANGUAGE_VERSION         = 0x8B8C
_global.GL_CURRENT_PROGRAM                  = 0x8B8D

# StencilFunction
_global.GL_NEVER                          = 0x0200
_global.GL_LESS                           = 0x0201
_global.GL_EQUAL                          = 0x0202
_global.GL_LEQUAL                         = 0x0203
_global.GL_GREATER                        = 0x0204
_global.GL_NOTEQUAL                       = 0x0205
_global.GL_GEQUAL                         = 0x0206
_global.GL_ALWAYS                         = 0x0207

# StencilOp
#      ZERO
_global.GL_KEEP                           = 0x1E00
_global.GL_REPLACE                        = 0x1E01
_global.GL_INCR                           = 0x1E02
_global.GL_DECR                           = 0x1E03
_global.GL_INVERT                         = 0x150A
_global.GL_INCR_WRAP                      = 0x8507
_global.GL_DECR_WRAP                      = 0x8508

# StringName
_global.GL_VENDOR                         = 0x1F00
_global.GL_RENDERER                       = 0x1F01
_global.GL_VERSION                        = 0x1F02

# TextureMagFilter
_global.GL_NEAREST                        = 0x2600
_global.GL_LINEAR                         = 0x2601

# TextureMinFilter
#      NEAREST
#      LINEAR
_global.GL_NEAREST_MIPMAP_NEAREST         = 0x2700
_global.GL_LINEAR_MIPMAP_NEAREST          = 0x2701
_global.GL_NEAREST_MIPMAP_LINEAR          = 0x2702
_global.GL_LINEAR_MIPMAP_LINEAR           = 0x2703

# TextureParameterName
_global.GL_TEXTURE_MAG_FILTER             = 0x2800
_global.GL_TEXTURE_MIN_FILTER             = 0x2801
_global.GL_TEXTURE_WRAP_S                 = 0x2802
_global.GL_TEXTURE_WRAP_T                 = 0x2803

# TextureTarget
_global.GL_TEXTURE_2D                     = 0x0DE1
_global.GL_TEXTURE                        = 0x1702

_global.GL_TEXTURE_CUBE_MAP               = 0x8513
_global.GL_TEXTURE_BINDING_CUBE_MAP       = 0x8514
_global.GL_TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515
_global.GL_TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516
_global.GL_TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517
_global.GL_TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518
_global.GL_TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519
_global.GL_TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A
_global.GL_MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C

# TextureUnit
_global.GL_TEXTURE0                       = 0x84C0
_global.GL_TEXTURE1                       = 0x84C1
_global.GL_TEXTURE2                       = 0x84C2
_global.GL_TEXTURE3                       = 0x84C3
_global.GL_TEXTURE4                       = 0x84C4
_global.GL_TEXTURE5                       = 0x84C5
_global.GL_TEXTURE6                       = 0x84C6
_global.GL_TEXTURE7                       = 0x84C7
_global.GL_TEXTURE8                       = 0x84C8
_global.GL_TEXTURE9                       = 0x84C9
_global.GL_TEXTURE10                      = 0x84CA
_global.GL_TEXTURE11                      = 0x84CB
_global.GL_TEXTURE12                      = 0x84CC
_global.GL_TEXTURE13                      = 0x84CD
_global.GL_TEXTURE14                      = 0x84CE
_global.GL_TEXTURE15                      = 0x84CF
_global.GL_TEXTURE16                      = 0x84D0
_global.GL_TEXTURE17                      = 0x84D1
_global.GL_TEXTURE18                      = 0x84D2
_global.GL_TEXTURE19                      = 0x84D3
_global.GL_TEXTURE20                      = 0x84D4
_global.GL_TEXTURE21                      = 0x84D5
_global.GL_TEXTURE22                      = 0x84D6
_global.GL_TEXTURE23                      = 0x84D7
_global.GL_TEXTURE24                      = 0x84D8
_global.GL_TEXTURE25                      = 0x84D9
_global.GL_TEXTURE26                      = 0x84DA
_global.GL_TEXTURE27                      = 0x84DB
_global.GL_TEXTURE28                      = 0x84DC
_global.GL_TEXTURE29                      = 0x84DD
_global.GL_TEXTURE30                      = 0x84DE
_global.GL_TEXTURE31                      = 0x84DF
_global.GL_ACTIVE_TEXTURE                 = 0x84E0

# TextureWrapMode
_global.GL_REPEAT                         = 0x2901
_global.GL_CLAMP_TO_EDGE                  = 0x812F
_global.GL_MIRRORED_REPEAT                = 0x8370

# Uniform Types
_global.GL_FLOAT_VEC2                     = 0x8B50
_global.GL_FLOAT_VEC3                     = 0x8B51
_global.GL_FLOAT_VEC4                     = 0x8B52
_global.GL_INT_VEC2                       = 0x8B53
_global.GL_INT_VEC3                       = 0x8B54
_global.GL_INT_VEC4                       = 0x8B55
_global.GL_BOOL                           = 0x8B56
_global.GL_BOOL_VEC2                      = 0x8B57
_global.GL_BOOL_VEC3                      = 0x8B58
_global.GL_BOOL_VEC4                      = 0x8B59
_global.GL_FLOAT_MAT2                     = 0x8B5A
_global.GL_FLOAT_MAT3                     = 0x8B5B
_global.GL_FLOAT_MAT4                     = 0x8B5C
_global.GL_SAMPLER_2D                     = 0x8B5E
_global.GL_SAMPLER_CUBE                   = 0x8B60

# Vertex Arrays
_global.GL_VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622
_global.GL_VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623
_global.GL_VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624
_global.GL_VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625
_global.GL_VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A
_global.GL_VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645
_global.GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F

# Shader Source
_global.GL_COMPILE_STATUS                 = 0x8B81

# Shader Precision-Specified Types
_global.GL_LOW_FLOAT                      = 0x8DF0
_global.GL_MEDIUM_FLOAT                   = 0x8DF1
_global.GL_HIGH_FLOAT                     = 0x8DF2
_global.GL_LOW_INT                        = 0x8DF3
_global.GL_MEDIUM_INT                     = 0x8DF4
_global.GL_HIGH_INT                       = 0x8DF5

# Framebuffer Object.
_global.GL_FRAMEBUFFER                    = 0x8D40
_global.GL_RENDERBUFFER                   = 0x8D41

_global.GL_RGBA4                          = 0x8056
_global.GL_RGB5_A1                        = 0x8057
_global.GL_RGB565                         = 0x8D62
_global.GL_DEPTH_COMPONENT16              = 0x81A5
_global.GL_STENCIL_INDEX                  = 0x1901
_global.GL_STENCIL_INDEX8                 = 0x8D48
_global.GL_DEPTH_STENCIL                  = 0x84F9

_global.GL_RENDERBUFFER_WIDTH             = 0x8D42
_global.GL_RENDERBUFFER_HEIGHT            = 0x8D43
_global.GL_RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44
_global.GL_RENDERBUFFER_RED_SIZE          = 0x8D50
_global.GL_RENDERBUFFER_GREEN_SIZE        = 0x8D51
_global.GL_RENDERBUFFER_BLUE_SIZE         = 0x8D52
_global.GL_RENDERBUFFER_ALPHA_SIZE        = 0x8D53
_global.GL_RENDERBUFFER_DEPTH_SIZE        = 0x8D54
_global.GL_RENDERBUFFER_STENCIL_SIZE      = 0x8D55

_global.GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0
_global.GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1
_global.GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2
_global.GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3

_global.GL_COLOR_ATTACHMENT0              = 0x8CE0
_global.GL_DEPTH_ATTACHMENT               = 0x8D00
_global.GL_STENCIL_ATTACHMENT             = 0x8D20
_global.GL_DEPTH_STENCIL_ATTACHMENT       = 0x821A

_global.GL_NONE                           = 0

_global.GL_FRAMEBUFFER_COMPLETE                      = 0x8CD5
_global.GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6
_global.GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7
_global.GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9
_global.GL_FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD

_global.GL_FRAMEBUFFER_BINDING            = 0x8CA6
_global.GL_RENDERBUFFER_BINDING           = 0x8CA7
_global.GL_MAX_RENDERBUFFER_SIZE          = 0x84E8

_global.GL_INVALID_FRAMEBUFFER_OPERATION  = 0x0506

# WebGL-specific enums
_global.GL_UNPACK_FLIP_Y_WEBGL            = 0x9240
_global.GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241
_global.GL_CONTEXT_LOST_WEBGL             = 0x9242
_global.GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243
_global.GL_BROWSER_DEFAULT_WEBGL          = 0x9244
