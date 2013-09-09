#= require 'jax/renderer'

Jax.Renderer.register class Jax.Renderer.WebGL
  @define 'backgroundColor',
    get: -> @_backgroundColor
    set: (v) ->
      vec4.copy @_backgroundColor, v
      @context.clearColor @_backgroundColor...
    
  constructor: (@canvas, @options) ->

  initialize: ->
    throw new Error "WebGL not supported!" unless @canvas.getContext
    @context = @canvas.getContext 'experimental-webgl', @options
    throw new Error "WebGL not supported!" unless @context
    
    @state = {}
    @_backgroundColor or= vec4.fromValues 0, 0, 0, 0
    
    @backgroundColor = [0,0,0,0]
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
    
  viewport: (x, y, w, h) ->
    if x isnt undefined
      @context.viewport x, y, w, h
    else
      canvasWidth  = @context.canvas.width
      canvasHeight = @context.canvas.height
      @context.viewport 0, 0, canvasWidth, canvasHeight

  createTexture: -> @context.createTexture()

  bindTexture: (target, handle) ->
    @context.bindTexture target, handle

  texImage2D: -> #(target, level, internalformat, width, height, border, format, type, pixels) ->
    @context.texImage2D.apply @context, arguments

  texParameteri: (target, type, value) ->
    @context.texParameteri target, type, value

  pixelStorei: (type, value) ->
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

  vertexAttribPointer: (indx, size, type, normalized, stride, offset) ->
    @context.vertexAttribPointer indx, size, type, normalized, stride, offset

  clearColor: (r, g, b, a) -> @context.clearColor r, g, b, a

  uniform1f: (l, v) -> @context.uniform1f l, v
  uniform1i: (l, v) -> @context.uniform1i l, v
  uniform2fv: (l, v) -> @context.uniform2fv l, v
  uniform3fv: (l, v) -> @context.uniform3fv l, v
  uniform4fv: (l, v) -> @context.uniform4fv l, v
  uniform2iv: (l, v) -> @context.uniform2iv l, v
  uniform3iv: (l, v) -> @context.uniform3iv l, v
  uniform4iv: (l, v) -> @context.uniform4iv l, v
  uniformMatrix2fv: (l, t, v) -> @context.uniformMatrix2fv l, t, v
  uniformMatrix3fv: (l, t, v) -> @context.uniformMatrix3fv l, t, v
  uniformMatrix4fv: (l, t, v) -> @context.uniformMatrix4fv l, t, v
  activeTexture: (t) -> @context.activeTexture t
  bindAttribLocation: (p, i, n) -> @context.bindAttribLocation p, i, n
  enableVertexAttribArray: (i) -> @context.enableVertexAttribArray i
  disableVertexAttribArray: (i) -> @context.disableVertexAttribArray i
  linkProgram: (p) -> @context.linkProgram p
  shaderSource: (shader, source) -> @context.shaderSource shader, source
  compileShader: (sh) -> @context.compileShader sh
  getShaderParameter: (sh, en) -> @context.getShaderParameter sh, en
  attachShader: (p, s) -> @context.attachShader p, s
  getProgramParameter: (p, n) -> @context.getProgramParameter p, n
  getProgramInfoLog: (p) -> @context.getProgramInfoLog p
  useProgram: (p) -> @context.useProgram p
  getParameter: (p) -> @context.getParameter p
  getShaderInfoLog: (s) -> @context.getShaderInfoLog s
  drawElements: (mode, count, type, offset) -> @context.drawElements mode, count, type, offset
  drawArrays: (mode, first, count) -> @context.drawArrays mode, first, count
  depthFunc: (f) -> @context.depthFunc f
  blendFunc: (s, d) -> @context.blendFunc s, d
  createProgram: -> @context.createProgram()
  createShader: (t) -> @context.createShader t
  createBuffer: -> @context.createBuffer()
  bindBuffer: (t, b) -> @context.bindBuffer t, b
  bufferData: (t, s, u) -> @context.bufferData t, s, u
  getUniformLocation: (p, n) -> @context.getUniformLocation p, n
  disable: (e) -> @context.disable e
  enable: (e) -> @context.enable e
  cullFace: (mode) -> @context.cullFace mode
  polygonOffset: (factor, units) -> @context.polygonOffset factor, units
  readPixels: (x, y, width, height, format, type, pixels) ->
    @context.readPixels x, y, width, height, format, type, pixels
  deleteRenderbuffer: (r) -> @context.deleteRenderbuffer r
  deleteFramebuffer: (f) -> @context.deleteFramebuffer f
  deleteTexture: (t) -> @context.deleteTexture t
  