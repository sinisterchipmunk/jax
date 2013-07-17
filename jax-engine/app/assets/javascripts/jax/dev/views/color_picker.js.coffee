class Jax.Dev.Views.ColorPicker extends Backbone.View
  tagName: "fieldset"
  className: "color"
  template: JST['jax/dev/color_picker']

  events:
    "change .alpha": "alphaChanged"
    "keyup .rgbhex": "colorChanged"

  @scrub: -> $("div.colorpicker").remove()

  alphaChanged: (e) ->
    @$(".alpha-slider").slider("value", $(e.target).val())
    @color.alpha = $(e.target).val()

  colorChanged: (e) ->
    try
      len = $(e.target).val().length
      if len is 7
        @color.parse $(e.target).val()
    catch e
      true

  jaxColorChanged: =>
    hex = @getColorString()
    @$(".rgbhex").css 'background-color', hex
    @$(".rgbhex").val hex
    avg = (@color.red + @color.green + @color.blue) / 3
    if avg > 0.5
      @$(".rgbhex").css 'color', '#000'
    else
      @$(".rgbhex").css 'color', '#fff'
    alphaHex = parseInt(@color.alpha * 255).toString(16)
    alphaHex = "0#{alphaHex}" if alphaHex.length is 1
    @$(".alpha").val alphaHex

  initialize: ->
    @options.alpha = true if @options.alpha is undefined
    # an instance of Jax.Color to bind to
    @color = @options.color
    @color.on 'change', @jaxColorChanged
    @render()

  getColorString: =>
    @color.toString 6

  setColorString: (hex) =>
    @color.parse hex

  render: ->
    @$el.html @template
      label: @options.label
      useAlpha: @options.alpha
      color: @getColorString()
      alpha: @color.alpha
    @$(".rgbhex").val @getColorString
    @$(".rgbhex").ColorPicker
      color: @getColorString()
      onBeforeShow: => @$('.rgbhex').ColorPickerSetColor @getColorString()
      onChange: (hsb, hex, rgb) => @setColorString "##{hex}"
    if @options.alpha
      @$(".alpha-slider").slider
        value: @color.alpha
        step: 0.001
        min: 0
        max: 1
        slide: (event, ui) => @color.alpha = ui.value
    @jaxColorChanged()
