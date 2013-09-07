#= require 'jax/renderer'

Jax.Renderer.register class Jax.Renderer.WebGL
  @define 'clearColor',
    get: -> @_clearColor
    set: (v) ->
      vec4.copy @_clearColor, v
      @context.clearColor @_clearColor...
    
  constructor: (@canvas, @options) ->

  initialize: ->
    throw new Error "WebGL not supported!" unless @canvas.getContext
    @context = @canvas.getContext 'experimental-webgl', @options
    throw new Error "WebGL not supported!" unless @context
    
    @state = {}
    @_clearColor or= vec4.fromValues 0, 0, 0, 0
    
    @clearColor = [0,0,0,0]
    @context.clearDepth 1.0
    @context.enable     GL_DEPTH_TEST
    @context.depthFunc  GL_LESS
    @context.enable     GL_BLEND
    @context.blendFunc  GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA
    @context.enable     GL_CULL_FACE
    
  clear: ->
    @context.clear GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT
    
  ###
  Prepare to render the scene.
  ###
  prepare: ->
    @viewport()
    
  viewport: ->
    canvasWidth  = @context.canvas.width
    canvasHeight = @context.canvas.height
    @context.viewport 0, 0, canvasWidth, canvasHeight

  createTexture: -> @context.createTexture()

  bindTexture: (target, handle) -> @context.bindTexture target, handle

  texImage2D: -> #(target, level, internalformat, width, height, border, format, type, pixels) ->
    @context.texImage2D.apply @context, arguments

  getState: (which) -> @state[which]

  texParameteri: (target, type, value) ->
    @state[type] = value
    @context.texParameteri target, type, value

  pixelStorei: (type, value) ->
    @state[type] = value
    @context.pixelStorei type, value

  hint: (n) -> @context.hint n

  generateMipmap: (target) -> @context.generateMipmap target

  deleteTexture: (texture) -> @context.deleteTexture texture

  checkFramebufferStatus: (glEnum) -> @context.checkFramebufferStatus glEnum

  framebufferTexture2D: (glEnum, attachment, target, handle, num) ->
    @context.framebufferTexture2D glEnum, attachment, target, handle, num

  framebufferRenderbuffer: (glEnum, attachment, target, handle) ->
    @context.framebufferRenderbuffer glEnum, attachment, target, handle

  renderbufferStorage: (glEnum, target, w, h) ->
    @context.renderbufferStorage glEnum, target, w, h

  bindRenderbuffer: (target, handle) ->
    @context.bindRenderbuffer target, handle

  createRenderbuffer: -> @context.createRenderbuffer()

  createFramebuffer: -> @context.createFramebuffer()

  bindFramebuffer: (target, handle) ->
    @context.bindFramebuffer target, handle

  
