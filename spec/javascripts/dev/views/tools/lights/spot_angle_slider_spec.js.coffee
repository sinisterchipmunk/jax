describe "Jax.Dev.Views.Tools.Lights.SpotAngleSlider", ->
  beforeEach ->
    @displayedInner = => parseFloat(@view.$("#spot-inner-angle").val())
    @displayedOuter = => parseFloat(@view.$("#spot-outer-angle").val())
    @model = new Jax.Light.Spot
      innerSpotAngle: 1
      outerSpotAngle: 2
    @view = new Jax.Dev.Views.Tools.Lights.SpotAngleSlider
      model: @model

  it 'should have model values by default', ->
    expect(@displayedInner()).toEqual 1
    expect(@displayedOuter()).toEqual 2

  describe 'setting inner higher than outer', ->
    beforeEach ->
      @view.$("#spot-inner-angle").val 3
      @view.$("#spot-inner-angle").trigger 'change'

    it 'should clamp outer to inner', ->
      expect(@view.$("#spot-outer-angle").val()).toEqual '3'
      expect(@model.outerSpotAngle).toEqual 3

    it 'should use specified inner', ->
      expect(@view.$("#spot-inner-angle").val()).toEqual '3'
      expect(@model.innerSpotAngle).toEqual 3

  describe 'setting outer lower than inner', ->
    beforeEach ->
      @view.$("#spot-outer-angle").val 0.5
      @view.$("#spot-outer-angle").trigger 'change'

    it 'should clamp inner to outer', ->
      expect(@view.$("#spot-inner-angle").val()).toEqual '0.5'
      expect(@model.innerSpotAngle).toEqual 0.5

  describe 'when the values have more than 6 digits precision', ->
    beforeEach ->
      @model.innerSpotAngle = 1.2345678
      @model.outerSpotAngle = 2.3456789

    it 'should truncate to 6 digits precision', ->
      expect(@view.$("#spot-inner-angle").val()).toEqual '1.234568'
      expect(@view.$("#spot-outer-angle").val()).toEqual '2.345679'

  describe 'setting the model values via slider', ->
    beforeEach ->
      # slider invokes `setModel`
      @view.setModel 2, 3

    it 'should set the model values', ->
      expect(@model.innerSpotAngle).toEqual 2
      expect(@model.outerSpotAngle).toEqual 3

  describe "when viewing as degrees", ->
    beforeEach ->
      @view.$("#degrees").prop 'checked', true
      @view.$("#degrees").trigger 'change'

    describe "multiple event triggers without change in values", ->
      beforeEach ->
        @value = @view.$("#spot-inner-angle").val()
        @view.$("#spot-inner-angle").trigger 'change'
        @view.$("#spot-inner-angle").trigger 'change'
        @view.$("#spot-inner-angle").trigger 'change'

      it 'should not change the value', ->
        expect(@view.$("#spot-inner-angle").val()).toEqual @value

    describe 'setting the model values via slider', ->
      beforeEach ->
        # slider invokes `setModel`
        @view.setModel 60, 90

      it 'should set the model values to radian values', ->
        expect([@model.innerSpotAngle]).toEqualVector [Math.PI/3]
        expect([@model.outerSpotAngle]).toEqualVector [Math.PI/2]

      it 'should display degrees', ->
        expect(@view.$("#spot-inner-angle").val()).toEqual '60'
        expect(@view.$("#spot-outer-angle").val()).toEqual '90'

    it 'should convert angle fields to degrees', ->
      expect(@displayedInner()).toEqual 57.29578
      expect(@displayedOuter()).toEqual 114.591559

    it 'should not modify actual model values', ->
      expect([@model.innerSpotAngle]).toEqualVector [1]
      expect([@model.outerSpotAngle]).toEqualVector [2]
