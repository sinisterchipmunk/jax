class Jax.Dev.Views.Tools.Lights.AttenuationSlider extends Backbone.View
  template: JST['jax/dev/tools/lights/attenuation_slider']

  events:
    "keyup .attenuation-dec": 'changed'

  changed: (e) =>
    val = $(e.target).val()
    @set val unless isNaN parseFloat val

  initialize: ->
    @model.on "#{@options.type}Changed", @refresh
    @render()

  refresh: (value) =>
    el = @$(".attenuation-dec")
    el.val value unless el.val() is value
    @$("#slider").slider
      value: value

  set: (value) =>
    @model[@options.type] = value

  render: =>
    @$el.html @template @options
    @$("#slider").slider
      value: @model[@options.type]
      step: 0.000001
      min: 0
      max: 1
      slide: (event, ui) => @set ui.value
    @refresh @model[@options.type]
