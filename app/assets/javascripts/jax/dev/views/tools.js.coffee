class Jax.Dev.Views.Tools extends Backbone.View
  COLLAPSED_WIDTH = '96px'
  COLLAPSED_HEIGHT = '24px'

  id: "tools"
  template: JST['jax/dev/tools']

  events:
    "click a.tools": "toggle"
    "click a.tab": "expand"

  toggle: (e) =>
    e?.preventDefault()
    if @_expanded
      @collapse()
    else
      @expand()

  collapse: =>
    @$el.animate {
      height: COLLAPSED_HEIGHT
      width: COLLAPSED_WIDTH
    }, 'fast'
    @_expanded = false

  expand: (e) =>
    e?.preventDefault()
    height = @$el.height()
    width = @$el.width()
    targetWidth = @$el.css('width', 'auto').width()
    targetHeight = @$el.css('height', 'auto').height()
    @$el.height(height)
    @$el.width(width)
    @$el.animate {
      height: targetHeight
      width: targetWidth
    }, 'fast'
    @_expanded = true

  initialize: ->
    # the Jax context to be interrogated/manipulated
    @jax = @options.context
    @tabs = new Jax.Dev.Views.TabSet
      tabs:
        "World":     new Jax.Dev.Views.Tools.World  context: @jax
        "Lights":    new Jax.Dev.Views.Tools.Lights context: @jax
        "Models":    $("<div/>")
        "Materials": $("<div/>")
    @render()

  render: ->
    @$el.html @template()
    @$el.append @tabs.$el
    @$el.css 'height', COLLAPSED_HEIGHT
    @$el.css 'width', COLLAPSED_WIDTH
    @_expanded = false
