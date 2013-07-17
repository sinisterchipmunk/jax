#= require dev/jquery.cookie
#= require jax/dev/views/drawer

class Jax.Dev.Views.ControllerList extends Jax.Dev.Views.Drawer
  collapseIcon: "collapse-large"
  expandIcon: "expand-large"
  iconSelector: "a.minify .icon"

  stateKey: "controller-list"
  tagName: "ul"
  id: 'controller-list'
  template: JST['jax/dev/controller_list']

  events:
    "click .minify": 'toggle'

  initialize: ->
    @render()
    @restoreState()

  add: (model) =>
    view = new Jax.Dev.Views.ControllerListItem
      model: model
    @$el.append view.$el

  render: =>
    @$el.html @template()
    @collection.each @add
    true

  beforeExpand: =>
    @$("li.header").css 'border-bottom-right-radius', '0px'
    @$el.css 'border-bottom-right-radius', '8px'
    super()

  afterCollapse: =>
    @$("li.header").css 'border-bottom-right-radius', '0px'
    @$el.css 'border-bottom-right-radius', '0px'
    super()

  afterExpand: =>
    @$el.css 'height', 'auto'
    @$el.css 'width', 'auto'
    super()
  