#= require 'jax/renderer'

###
Headless renderer is used as a mock-up for running Jax in environments that
do not support WebGL, e.g. for unit testing or for other non-standard uses.

Note that the headless renderer does not actually draw anything to any
surface at this time, though perhaps one day it will be extended to do so.
###
Jax.Renderer.register class Jax.Renderer.Headless

  constructor: (@canvas, @options) ->

  initialize: ->
  clear: ->
  prepare: ->
  viewport: ->
  createTexture: -> {}
  deleteTexture: (tex) ->
  texParameteri: ->
  bindTexture: (tex) ->
  pixelStorei: ->
  hint: ->
  generateMipmap: ->
  texImage2D: ->
  createFramebuffer: -> {}
  bindFramebuffer: ->
  checkFramebufferStatus: -> GL_FRAMEBUFFER_COMPLETE
  framebufferTexture2D: ->
  framebufferRenderbuffer: ->
  renderbufferStorage: ->
  bindRenderbuffer: ->
  createRenderbuffer: -> {}
  vertexAttribPointer: ->
  uniform1f: ->
  uniform1i: ->
  uniform2fv: ->
  uniform3fv: ->
  uniform4fv: ->
  uniform2iv: ->
  uniform3iv: ->
  uniform4iv: ->
  uniformMatrix2fv: ->
  uniformMatrix3fv: ->
  uniformMatrix4fv: ->
  activeTexture: ->
  bindAttribLocation: ->
  enableVertexAttribArray: ->
  disableVertexAttribArray: ->
  linkProgram: ->
  shaderSource: ->
  compileShader: ->
  getShaderParameter: -> 1
  attachShader: ->
  getProgramParameter: -> 1
  getProgramInfoLog: ->
  useProgram: ->
  getParameter: -> 10000
  getShaderInfoLog: ->
  drawElements: ->
  drawArrays: ->
  depthFunc: ->
  blendFunc: ->
  createProgram: -> {}
  createShader: -> {}
  createBuffer: -> {}
  bindBuffer: ->
  bufferData: ->
  getUniformLocation: -> 1
  clearColor: ->

  disable: ->
  enable: ->
  cullFace: ->
  polygonOffset: ->
  readPixels: ->
  deleteRenderbuffer: ->
  deleteFramebuffer: ->
  deleteTexture: ->
  