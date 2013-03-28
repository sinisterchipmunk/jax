#= require dev/jquery-ui

class Jax.Dev.Views.WebGLCanvas extends Backbone.View
  tagName: "canvas"

  startController: (name) ->
    @jax.redirectTo name

  initialize: ->
    @render()
    # add to window to give dev a handle on jax context for console debugging
    window.jax = @jax = new Jax.Context canvas: @el
    @startController 'jax'

  render: ->
    @$el.attr 'width', '1024'
    @$el.attr 'height', '768'
