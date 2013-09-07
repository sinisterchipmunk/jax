#= require 'jax/renderer'

###
Headless renderer is used as a mock-up for running Jax in environments that
do not support WebGL, e.g. for unit testing or for other non-standard uses.

Note that the headless renderer does not actually draw anything to any
surface at this time, though perhaps one day it will be extended to do so.
###
Jax.Renderer.register class Jax.Renderer.Headless

  constructor: (canvas, options) ->

  initialize: ->
    
  clear: ->
    
  ###
  Prepare to render the scene.
  ###
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

  createRenderbuffer: ->
