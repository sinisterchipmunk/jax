class Jax.Dev.Views.Tools.Lights.Item extends Jax.Dev.Views.Drawer
  iconSelector: "a.header .icon"
  collapsedHeight: '36px'

  template: JST['jax/dev/tools/lights/item']

  className: "light"

  events:
    "click a.header": "toggle"
    "change #shadows, #enabled": "booleanChanged"

  initialize: ->
    @stateKey = "light_#{@model.__unique_id}"
    @render()
    @restoreState()

  booleanChanged: (e) =>
    name = $(e.target).attr("id")
    @model[name] = not @model[name]

  addColorPicker: (label, color) ->
    @$("#colors").append new Jax.Dev.Views.ColorPicker(
      label: label
      color: color
    ).$el

  addAttenuationSlider: (label, type) ->
    @$("#attenuation").append new Jax.Dev.Views.Tools.Lights.AttenuationSlider(
      label: label
      type: type
      model: @model.attenuation
    ).$el

  render: =>
    @$el.html @template
      klass: @model.__proto__.constructor.name
      id: @model.__unique_id
    @$el.attr 'data-id', @model.__unique_id
    @addColorPicker "Ambient", @model.color.ambient
    @addColorPicker "Diffuse", @model.color.diffuse
    @addColorPicker "Specular", @model.color.specular
    @addAttenuationSlider "Constant",  'constant'
    @addAttenuationSlider "Linear",    'linear'
    @addAttenuationSlider "Quadratic", 'quadratic'
    @$("#shadows").prop 'checked', @model.shadows
    @$("#enabled").prop 'checked', @model.enabled
