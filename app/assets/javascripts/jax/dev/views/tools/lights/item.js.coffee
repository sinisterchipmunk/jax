class Jax.Dev.Views.Tools.Lights.Item extends Backbone.View
  template: JST['jax/dev/tools/lights/item']

  className: "light"

  events:
    "click a.header": "toggle"

  toggle: (e) =>
    if @isExpanded()
      @collapse e
    else
      @expand e

  isExpanded: =>
    @_expanded

  collapse: (e) =>
    e?.preventDefault()
    @_expanded = false
    @$(".icon").removeClass('collapse-small').addClass 'expand-small'
    @$el.animate {
      'height': '24px'
    }, 'fast'

  expand: (e) =>
    e?.preventDefault()
    @_expanded = true
    @$(".icon").removeClass('expand-small').addClass 'collapse-small'
    height = @$el.css('height')
    targetHeight = @$el.css('height', 'auto').height()
    @$el.css 'height', height
    @$el.animate {
      'height': targetHeight
    }, 'fast'

  initialize: ->
    @render()

  addColorPicker: (label, color) ->
    @$("#colors").append new Jax.Dev.Views.ColorPicker(
      label: label
      color: color
    ).$el

  render: =>
    @$el.html @template klass: @model.__proto__.constructor.name
    @addColorPicker "Ambient Color", @model.color.ambient
    @addColorPicker "Diffuse Color", @model.color.diffuse
    @addColorPicker "Specular Color", @model.color.specular
    @_expanded = true
