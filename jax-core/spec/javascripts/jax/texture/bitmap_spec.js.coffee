describe 'Jax.Texture.Bitmap', ->
  describe 'initialized with an image', ->
    beforeEach ->
      @image = new Image
      @tex = new Jax.Texture.Bitmap @image

    it 'should try to upload the image when validating', ->
      spyOn(@context.renderer, 'texImage2D')
      @tex.validate @context
      expect(@context.renderer.texImage2D).toHaveBeenCalled()

    it 'should assume the image is ready', ->
      expect(@tex).toBeReady()

    describe 'when the image has not loaded yet and texImage2D throws', ->
      beforeEach -> @spy = spyOn(@context.renderer, 'texImage2D').andThrow()

      it 'should catch the error', ->
        expect(=> @tex.validate @context).not.toThrow()

      it 'should become not ready', ->
        @tex.validate @context
        expect(@tex).not.toBeReady()

      describe 'when the image finishes loading', ->
        beforeEach -> $(@image).trigger 'load'

        it 'should become ready', ->
          expect(@tex).toBeReady()

        it 'should try to upload the image when validating', ->
          @context.renderer.texImage2D.reset()
          @tex.validate @context
          expect(@context.renderer.texImage2D).toHaveBeenCalled()

  describe 'initialized with a path', ->
    beforeEach -> @tex = new Jax.Texture.Bitmap path: '/path/to/image.png'

    describe 'after the image loads', ->
      beforeEach ->
        @image = @tex.get 'data'
        @image.width = 128
        @image.height = 128
        $(@image).trigger 'load'

      it 'should set the texture width', ->
        expect(@tex.get('width')).toEqual 128

      it 'should set the texture height', ->
        expect(@tex.get('height')).toEqual 128
