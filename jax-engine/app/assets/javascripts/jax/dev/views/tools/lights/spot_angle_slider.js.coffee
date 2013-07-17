#= require 'dev/jquery-ui-range-slider'

class Jax.Dev.Views.Tools.Lights.SpotAngleSlider extends Backbone.View
  template: JST['jax/dev/tools/lights/spot_angles']

  tagName: "fieldset"

  events:
    "keyup  #spot-inner-angle": "innerFieldChanged"
    "change #spot-inner-angle": "innerFieldChanged"
    "keyup  #spot-outer-angle": "outerFieldChanged"
    "change #spot-outer-angle": "outerFieldChanged"
    "change #degrees"        : "scaleChanged"

  initialize: ->
    @render()
    @model.on 'innerSpotAngleChanged', @innerSpotAngleChanged
    @model.on 'outerSpotAngleChanged', @outerSpotAngleChanged

  scaleChanged: (e) ->
    [inner, outer] = [@model.innerSpotAngle, @model.outerSpotAngle]
    if @useDegrees()
      newMax = 180 - Math.EPSILON
    else
      newMax = Math.TAU / 2 - Math.EPSILON
    @$("#slider").dragslider 'option', 'max', newMax
    @$("#slider").dragslider 'values', @$("#slider").dragslider 'values'
    @setModel @displayedValues()...

  useDegrees: ->
    @$("#degrees").prop 'checked'

  innerFieldChanged: ->
    inner = parseFloat @$("#spot-inner-angle").val()
    outer = parseFloat @$("#spot-outer-angle").val()
    return if isNaN(inner) or isNaN(outer)
    if inner > outer
      outer = inner
    @$("#slider").dragslider 'values', [inner, outer]
    @setModel inner, outer

  outerFieldChanged: ->
    inner = parseFloat @$("#spot-inner-angle").val()
    outer = parseFloat @$("#spot-outer-angle").val()
    return if isNaN(inner) or isNaN(outer)
    if outer < inner
      inner = outer
    @$("#slider").dragslider 'values', [inner, outer]
    @setModel inner, outer

  innerSpotAngleChanged: (v) =>
    # truncate to 6 digits precision
    v = Math.rad2deg v if @useDegrees()
    v = @round v
    el = @$("#spot-inner-angle")
    @refresh()

  outerSpotAngleChanged: (v) =>
    # truncate to 6 digits precision
    v = Math.rad2deg v if @useDegrees()
    v = @round v
    el = @$("#spot-outer-angle")
    @refresh()

  refreshSlider: ->
    @$("#slider").dragslider 'values', @displayedValues()

  refresh: ->
    values = @displayedValues()
    innerEl = @$("#spot-inner-angle")
    outerEl = @$("#spot-outer-angle")
    innerEl.val values[0] unless parseFloat(innerEl.val()) is values[0]
    outerEl.val values[1] unless parseFloat(outerEl.val()) is values[1]
    @refreshSlider()

  displayedValues: ->
    [inner, outer] = [@model.innerSpotAngle, @model.outerSpotAngle]
    if @useDegrees()
      inner = Math.rad2deg inner
      outer = Math.rad2deg outer
    [@round(inner), @round(outer)]

  round: (v) -> parseFloat v.toFixed 6

  setModel: (inner, outer) ->
    if @useDegrees()
      inner = Math.deg2rad inner
      outer = Math.deg2rad outer
    @model.innerSpotAngle = inner
    @model.outerSpotAngle = outer

  render: ->
    @$el.html @template @options
    @$("#slider").dragslider
      # animate: true
      range: true
      rangeDrag: true
      step: 0.001
      values: [@model.innerSpotAngle, @model.outerSpotAngle]
      min: 0
      max: Math.TAU / 2 - Math.EPSILON # max is 179.999999 deg
      slide: (event, ui) => @setModel ui.values...
    @refresh()
