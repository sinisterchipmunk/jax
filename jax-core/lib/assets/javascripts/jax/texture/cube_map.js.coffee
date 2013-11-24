###

Usually used for environment mapping, a cube map binds a different texture
to each of 6 sides: `left`, `right`, `top`, `bottom`, `near` and `far`.

The cube map will only be used if all 6 sides have a bound instance of
`Jax.Texture` or one of its subclasses, and each instance is itself ready to
be used.

Usage example:

    new Jax.Texture.CubeMap
      left:   new Jax.Texture.Bitmap(...)
      right:  new Jax.Texture.Bitmap(...)
      top:    new Jax.Texture.Bitmap(...)
      bottom: new Jax.Texture.Bitmap(...)
      near:   new Jax.Texture.Bitmap(...)
      far:    new Jax.Texture.Bitmap(...)

###
class Jax.Texture.CubeMap extends Jax.Texture
  constructor: (options) ->
    @on 'change:left   change:right change:top
         change:bottom change:near  change:far', @dirChanged
    $.extend options,
      wrap_s: GL_CLAMP_TO_EDGE
      wrap_t: GL_CLAMP_TO_EDGE
      min_filter: GL_LINEAR
      mag_filter: GL_LINEAR
      target: GL_TEXTURE_CUBE_MAP
    super options

  dispose: (context) ->
    @disposeFramebuffer context
    super context

  ###
  Returns a valid, complete framebuffer representing this cube map.
  ###
  getFramebuffer: (context) ->
    return framebuffer if framebuffer = @get 'framebuffer'
    [width, height] = [@get('width'), @get('height')]

    @set 'framebuffer', framebuffer = context.renderer.createFramebuffer()
    context.renderer.bindFramebuffer GL_FRAMEBUFFER, framebuffer

    # TODO: support depth OR stencil OR (depth AND stencil) OR none
    @set 'depthbuffer', depthbuffer = context.renderer.createRenderbuffer()
    context.renderer.bindRenderbuffer GL_RENDERBUFFER, depthbuffer
    context.renderer.renderbufferStorage GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height
    context.renderer.framebufferRenderbuffer GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthbuffer
    context.renderer.bindRenderbuffer GL_RENDERBUFFER, null

    framebuffer

  ###
  Disposes of the framebuffer allocated for this cube map, if any.
  ###
  disposeFramebuffer: (context) ->
    if stencil = @get 'stencilbuffer'
      context.renderer.deleteRenderbuffer stencil
    if depth = @get 'depthbuffer'
      context.renderer.deleteRenderbuffer depth
    if depthStencil = @get 'depthStencilbuffer'
      context.renderer.deleteRenderbuffer depthStencil
    if frame = @get 'framebuffer'
      context.renderer.deleteFramebuffer @get 'framebuffer'
    @set 'stencilbuffer',      null
    @set 'depthbuffer',        null
    @set 'depthStencilbuffer', null
    @set 'framebuffer',        null

  ###
  Constructs a framebuffer, binds it, calls the `callback`, and then unbinds
  the framebuffer. Returns the framebuffer. Any rendering done within the
  `callback` will be applied to the framebuffer instead of to the main canvas.
  The `face` should be one of 'left', 'right', 'top', 'bottom', 'near' or
  'far', corresponding to the textures that are associated with this cube map.

  If this texture is not valid (`isReady` or `validate` return false), this
  method exits early and does _not_ call the callback.
  ###
  renderTo: (context, face, callback) ->
    if handle = @validate context
      framebuffer = @getFramebuffer context
      context.renderer.bindFramebuffer GL_FRAMEBUFFER, framebuffer
      context.renderer.framebufferTexture2D GL_FRAMEBUFFER,
                                            GL_COLOR_ATTACHMENT0,
                                            @get('data')[face].get('target'),
                                            handle,
                                            0
      context.renderer.viewport 0, 0, @get('width'), @get('height')
      callback()
      context.renderer.bindFramebuffer GL_FRAMEBUFFER, null
      context.renderer.viewport()
      framebuffer

  dirChanged: (self, eventName) =>
    data = @get('data') || {}
    switch eventName
      when 'change:left'
        data.left = @get 'left'
        data.left?.set 'target',   GL_TEXTURE_CUBE_MAP_NEGATIVE_X
      when 'change:right'
        data.right = @get 'right'
        data.right?.set 'target',  GL_TEXTURE_CUBE_MAP_POSITIVE_X
      when 'change:top'
        data.top = @get 'top'
        data.top?.set 'target',    GL_TEXTURE_CUBE_MAP_POSITIVE_Y
      when 'change:bottom'
        data.bottom = @get 'bottom'
        data.bottom?.set 'target', GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
      when 'change:near'
        data.near = @get 'near'
        data.near?.set 'target',   GL_TEXTURE_CUBE_MAP_POSITIVE_Z
      when 'change:far'
        data.far = @get 'far'
        data.far?.set 'target',    GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    @set 'data', data

  upload: (context, handle, data) =>
    {left, right, top, bottom, near, far} = data
    gl = context.renderer
    for texture in [left, right, top, bottom, near, far]
      data = texture.get('data')
      if data.length isnt undefined
        gl.texImage2D texture.get('target'), 0,
                      texture.get('format'), 
                      texture.get('width'), texture.get('height'), 0,
                      texture.get('format'),
                      texture.get('data_type'), data
      else
        gl.texImage2D texture.get('target'), 0,
                      texture.get('format'), texture.get('format'),
                      texture.get('data_type'), texture.get('data')
    this

  isReady: =>
    data = @get 'data'
    data && data.left?.isReady() && data.right?.isReady()  &&
            data.top?.isReady()  && data.bottom?.isReady() &&
            data.near?.isReady() && data.far?.isReady()
