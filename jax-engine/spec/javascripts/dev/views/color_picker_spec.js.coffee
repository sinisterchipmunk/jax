describe "Jax.Dev.Views.ColorPicker", ->
  beforeEach -> @color = new Jax.Color

  sharedExamplesFor "a color picker", ->
    it 'should render the label', ->
      expect(@view.$el.text()).toMatch /Chosen Color/

    it 'should default the color field to the color value', ->
      expect(@view.$(".rgbhex").val()).toEqual '#ffffff'

  describe 'with alpha', ->
    beforeEach -> @view = new Jax.Dev.Views.ColorPicker
      label: 'Chosen Color'
      color: @color

    itShouldBehaveLike "a color picker"

    it 'should render an alpha slider', ->
      expect(@view.$(".alpha")).not.toBeEmpty()

    it 'should default alpha field to alpha value', ->
      expect(@view.$(".alpha").val()).toEqual 'ff'

  describe "without alpha", ->
    beforeEach -> @view = new Jax.Dev.Views.ColorPicker
      label: 'Chosen Color'
      color: @color
      alpha: false

    itShouldBehaveLike "a color picker"

    it 'should not render an alpha slider', ->
      expect(@view.$(".alpha")).toBeEmpty()
