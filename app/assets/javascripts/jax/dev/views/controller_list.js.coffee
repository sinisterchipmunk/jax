#= require dev/jquery.cookie

class Jax.Dev.Views.ControllerList extends Backbone.View
  tagName: "ul"
  id: 'controller-list'
  template: JST['jax/dev/controller_list']

  events:
    "click .minify": 'toggle'

  @scrub: ->
    $.removeCookie 'controller-list-minified'

  toggle: (e) =>
    e?.preventDefault()
    if @minified
      @expand()
    else
      @minify()

  expand: ->
    @$("a.minify .icon").css 'background-position', '-16px -192px'
    @$("li.header").css 'border-bottom-right-radius', '0px'
    if @minified
      curHeight = @$el.height()
      targetHeight = @$el.css('height', 'auto').height()
      @$el.css 'height', "#{curHeight}px"
      @$el.animate {
        'height': targetHeight
      }, 'fast', =>
        @$el.css 'height', 'auto'
    @minified = false
    @saveState()

  minify: ->
    @$("a.minify .icon").css 'background-position', '0 -192px'
    unless @minified
      @$el.animate {
        'height': '24px'
      }, 'fast', =>
        @$("li.header").css 'border-bottom-right-radius', '8px'
    @minified = true
    @saveState()

  isMinified: -> @minified

  initialize: ->
    @render()
    @minified = false
    @restoreState()

  saveState: =>
    $.cookie 'controller-list-minified', "#{@minified}", expires: 365

  restoreState: =>
    if $.cookie('controller-list-minified') is 'true'
      @minify()
    else
      @expand()

  add: (model) =>
    view = new Jax.Dev.Views.ControllerListItem
      model: model
    @$el.append view.$el

  render: =>
    @$el.html @template()
    @collection.each @add
    true
