class Jax.Dev.Views.Tools.Lights.Item extends Jax.Dev.Views.Drawer
  iconSelector: "a.header .icon"

  template: JST['jax/dev/tools/lights/item']

  className: "light"

  events:
    "click a.header": "toggle"

  initialize: ->
    @stateKey = "light_#{@model.__unique_id}"
    @render()
    @restoreState()

  addColorPicker: (label, color) ->
    @$("#colors").append new Jax.Dev.Views.ColorPicker(
      label: label
      color: color
    ).$el

  render: =>
    @$el.html @template klass: @model.__proto__.constructor.name
    @$el.attr 'data-id', @model.__unique_id
    @addColorPicker "Ambient Color", @model.color.ambient
    @addColorPicker "Diffuse Color", @model.color.diffuse
    @addColorPicker "Specular Color", @model.color.specular
    @_expanded = true
