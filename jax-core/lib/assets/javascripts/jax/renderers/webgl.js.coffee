#= require 'jax/renderer'

Jax.Renderer.register class Jax.Renderer.WebGL
  @define 'clearColor',
    get: -> @_clearColor
    set: (v) ->
      vec4.copy @_clearColor, v
      @context.clearColor @_clearColor...
    
  constructor: (canvas, options) ->
    throw new Error "WebGL not supported!" unless canvas.getContext
    @context = canvas.getContext 'experimental-webgl', options
    throw new Error "WebGL not supported!" unless @context
    
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
