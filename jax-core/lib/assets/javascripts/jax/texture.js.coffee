#= require jax/mixins/attributes
#= require jax/mixins/event_emitter
#= require_self
#= require_tree ./texture

###

The base class for all textures in Jax. Usually, you want one of the
subclasses of `Jax.Texture` instead.

The base class can be useful if you have a special one-off use case, but it
is probably a better idea to go ahead and subclass `Jax.Texture` anyway.

If you are sure you need to instantiate `Jax.Texture` directly, then you
may want to provide an `upload` option. This should be a function, which
will replace the default `upload` method defined by this class. See the
documentation for the `upload` method for more details.

###
class Jax.Texture
  @include Jax.Mixins.Attributes
  @include Jax.Mixins.EventEmitter

  constructor: (options = {}) ->
    @initializeAttributes()
    @upload = options.upload if options.upload isnt undefined
    @on 'change:width change:height', @sizeChanged
    @on 'change:min_filter              change:mag_filter
         change:generate_mipmap         change:mipmap_hint
         change:format                  change:target
         change:date_type               change:wrap_s
         change:wrap_t change:flip_y    change:premultiply_alpha
         change:colorspace_conversion   change:data',
         @texParamChanged
    @set 'handles',               {}
    @set 'min_filter',            GL_NEAREST_MIPMAP_LINEAR
    @set 'mag_filter',            GL_LINEAR
    @set 'generate_mipmap',       true
    @set 'mipmap_hint',           GL_DONT_CARE
    @set 'format',                GL_RGBA
    @set 'target',                GL_TEXTURE_2D
    @set 'data_type',             GL_UNSIGNED_BYTE
    @set 'wrap_s',                GL_REPEAT
    @set 'wrap_t',                GL_REPEAT
    @set 'flip_y',                false
    @set 'premultiply_alpha',     false
    @set 'colorspace_conversion', true
    @set 'width',                 1
    @set 'height',                1
    for option, value of options
      @set option, value
    true

  ###
  Callback which is fired whenever a texture parameter changes which must
  be reflected within a renderer. This method causes the texture to become
  invalid, and also makes a note as to which parameters must be refreshed.
  ###
  texParamChanged: (self, evtName) =>
    @invalidate()

  ###
  Finds or creates and then returns the texture handle for the given context.
  ###
  getHandle: (context) ->
    handle = @get('handles')[context.id] or= context.renderer.createTexture()

  ###
  Deletes the texture handle associated with the specified context. This
  method is responsible for performing any and all shutdown related to this
  texture.
  ###
  dispose: (context) ->
    handles = @get('handles')
    context.renderer.deleteTexture handles[context.id] if handles[context.id]
    handles[context.id] = null

  ###
  Invalidates the specified texture parameter so that the next time this
  texture validated, it will cause the specified texture parameter to be
  updated.
  ###
  invalidate: (param) ->
    @set 'valid', false

  ###
  Returns true if this texture is valid for rendering, false otherwise.
  Changes to the texture which have not been correlated within the renderer
  will cause it to be invalid. Textures are invalid by default. They become
  valid automatically when they are bound to a graphics driver.
  ###
  isValid: -> @get 'valid'

  ###
  Forces this texture to become valid, even if the latest changes have not
  been reflected within the graphics driver.
  ###
  forceValid: -> @set 'valid', true

  ###
  Subclasses _should_ implement this method. It is called during validation,
  whenever the image data needs to be uploaded to the graphics driver. It
  receives the context and the texture handle. Subclasses should use this
  method to upload texture data to the renderer.

  Note: by default, this method will upload a blank texture with dimensions
  equal to the `width` and `height` properties, which both default to `1`.
  This default implementation is probably fine for use as framebuffers
  rendering targets, assuming you set `width` and `height` appropriately.
  ###
  upload: (context, handle, textureData) ->
    context.renderer.texImage2D @get('target'), 0, @get('format'),
                                @get('width'),     @get('height'), 0,
                                @get('format'),    @get('data_type'),
                                textureData

  ###
  Subclasses should implement this method. Its function is to check whether
  the underlying texture data is ready to be used. For example, a texture that
  is loaded from a remote resource would return `false` until the resource has
  been loaded, `true` afterward.

  The default implementation always returns true.
  ###
  isReady: -> true

  ###
  Ensures that the texture handle exists for the given context, and verifies
  that the texture is valid for rendering. If it is not, this method takes
  the necessary steps to make the texture valid.

  If `isReady` returns false, this method has no effect and returns `false`.
  ###
  validate: (context) ->
    return false unless @isReady()
    attrs = @attributes
    handle = @getHandle context
    return handle if @get('valid')
    # texture is not valid, make it so!
    target = attrs.target
    gl = context.renderer
    gl.bindTexture target, handle

    gl.texParameteri target, GL_TEXTURE_MAG_FILTER, attrs.mag_filter
    gl.texParameteri target, GL_TEXTURE_MIN_FILTER, attrs.min_filter
    gl.texParameteri target, GL_TEXTURE_WRAP_S,     attrs.wrap_s
    gl.texParameteri target, GL_TEXTURE_WRAP_T,     attrs.wrap_t
    gl.pixelStorei GL_UNPACK_FLIP_Y_WEBGL, attrs.flip_y
    gl.pixelStorei GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, attrs.premultiply_alpha
    conversion = if attrs.colorspace_conversion then GL_BROWSER_DEFAULT_WEBGL else GL_NONE
    gl.pixelStorei GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, conversion

    @upload context, handle, attrs.data

    if attrs.generate_mipmap
      @generateMipmap gl, target, attrs.mipmap_hint

    # done!
    @forceValid()
    return handle

  generateMipmap: (renderer, target, hint) ->
    # FIXME why does this raise 1280 invalid enum?
    # renderer.hint GL_GENERATE_MIPMAP_HINT, hint
    renderer.generateMipmap target

  ###
  Callback which is fired whenever the `width` or `height` attribute changes.
  If either is a non-power-of-two value, this texture's other attributes will
  be set to compatibility values in order to make the texture renderable.
  Otherwise, they are left unchanged.

  This method will automatically resize the `data` array as needed, if it is
  indeed an array.
  ###
  sizeChanged: =>
    width = @get('width') || 1
    height = @get('height') || 1
    if Jax.Util.isPowerOfTwo(width) and Jax.Util.isPowerOfTwo(height)
      @isPoT = true
    else
      if @isPoT
        @set 'min_filter', GL_LINEAR
        @set 'mag_filter', GL_LINEAR
        @set 'wrap_s', GL_CLAMP_TO_EDGE
        @set 'wrap_t', GL_CLAMP_TO_EDGE
        @set 'generate_mipmap', false
      @isPoT = false
    data = @get 'data'
    if data is undefined or data instanceof Uint8Array
      @resizeData width * height * Jax.Util.sizeofFormat @get "format"

  ###
  The `data` array will be resized
  to the given length and as much as possible of its contents will be copied
  into the new array. If the current length is the same as the given length,
  the existing data is not changed. If the data is not an array, it is left
  unchanged.

  This method is called when the `width` or `height` is explicitly changed,
  so that the image data to be uploaded to the graphics driver matches the
  specified dimensions. It is _not_ called if the `data` is not an array.
  ###
  resizeData: (newLength) ->
    data = @get 'data'
    if data?.length is newLength
      newData = data
    else
      newData = new Uint8Array newLength
      if data
        for i in [0...newData.length]
          break if i >= data.length
          newData[i] = data[i]
    @set 'data', newData
