class Jax.Dev.Views.ColorPicker extends Backbone.View
  tagName: "input"

  initialize: ->
    # an instance of Jax.Color to bind to
    @color = @options.color
    @color.on 'change', => @$el.val @getColorString()
    @render()

  getColorString: =>
    if @options.alpha
      @color.toString 8
    else
      @color.toString 6

  render: ->
    @$el.attr 'type', 'text'
    @textField = @$el
    @textField.val @getColorString()
    @textField.css 'width', '58px'
    @textField.css 'padding', '4px'
    @textField.css 'border-width', '1px'
    @textField.ColorPicker
      color: @getColorString()
      onBeforeShow: =>
        @textField.ColorPickerSetColor @getColorString()
      onChange: (hsb, hex, rgb) =>
        @textField.css 'background-color', '#' + hex
        @color.parse '#' + hex
        avg = (@color.red + @color.green + @color.blue) / 3
        if avg > 0.5
          @textField.css 'color', '#000'
        else
          @textField.css 'color', '#fff'
