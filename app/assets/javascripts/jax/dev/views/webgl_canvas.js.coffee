#= require dev/jquery-ui

class Jax.Dev.Views.WebGLCanvas extends Backbone.View
  tagName: "canvas"

  events:
    "click": "focus"

  focus: => @$el.focus()

  startController: (name) ->
    @jax.redirectTo name

  initialize: ->
    @render()
    # add to window to give dev a handle on jax context for console debugging
    # - first dispose the context, if any, else it'll keep rendering in the
    #   background
    window.jax?.dispose()
    window.jax = @jax = new Jax.Context canvas: @el
    @startController 'jax'

  render: ->
    @$el.attr 'width', '1024'
    @$el.attr 'height', '768'
