sharedExamplesFor "a light source", ->

  describe 'with shadows enabled', ->
    beforeEach ->
      @light.shadows = true
      @light.validate @context

    it 'should be valid (sanity check)', ->
      expect(@light.shadowmap).toBeValid @context

    describe 'when its camera direction is set', ->
      beforeEach ->
        @light.camera.setDirection [1, 0, 0]

      it 'should invalidate the shadow map', ->
        expect(@light.shadowmap).not.toBeValid @context
