#= require jax/dev/views/drawer

class Jax.Dev.Views.Tools extends Jax.Dev.Views.Drawer
  collapsedWidth: '96px'
  collapseIcon: null
  expandIcon:   null
  stateKey: 'tools'

  id: "tools"
  template: JST['jax/dev/tools']

  events:
    "click a.tools": "toggle"
    "click a.tab": "expand"

  initialize: ->
    # the Jax context to be interrogated/manipulated
    @jax = @options.context
    @tabs = new Jax.Dev.Views.TabSet
      tabs:
        "World":     new Jax.Dev.Views.Tools.World  context: @jax
        "Lights":    new Jax.Dev.Views.Tools.Lights context: @jax
        "Models":    $("<div/>")
        "Materials": $("<div/>")
    @tabs.on 'layout', @layout
    @render()
    @restoreState()

  render: ->
    @$el.html @template()
    @$el.append @tabs.$el
