describe 'Jax.Texture', ->
  beforeEach -> @tex = new Jax.Texture()

  describe 'getHandle', ->
    it 'should create a new handle', ->
      spyOn @context.renderer, 'createTexture'
      @tex.getHandle @context
      expect(@context.renderer.createTexture).toHaveBeenCalled()

    it 'should return the new texture handle', ->
      expect(@tex.getHandle(@context)).not.toBeUndefined()

  describe 'when a handle exists', ->
    beforeEach ->
      handles = {}
      handles[@context.id] = 1
      @tex.set 'handles', handles

    it 'should return the existing handle', ->
      expect(@tex.getHandle(@context)).toEqual 1

    it 'should be destroyed when calling dispose with a context', ->
      spyOn @context.renderer, 'deleteTexture'
      @tex.dispose @context
      expect(@context.renderer.deleteTexture).toHaveBeenCalledWith 1

  describe 'validating with a context', ->
    beforeEach ->
      spyOn(@context.renderer, 'createTexture').andReturn 1
      spyOn @context.renderer, 'texParameteri'
      spyOn @context.renderer, 'bindTexture'
      @result = @tex.validate @context

    it 'should apply texture params', ->
      expect(@context.renderer.texParameteri).toHaveBeenCalled()

    it 'should return the texture handle', ->
      expect(@result).toEqual 1

  describe 'by default', ->
    sharedExamplesFor 'non-power-of-two texture', ->
      it 'should set pot rendering options', ->
        expect(@tex.get 'min_filter').toEqual GL_LINEAR
        expect(@tex.get 'mag_filter').toEqual GL_LINEAR
        expect(@tex.get 'wrap_s').toEqual GL_CLAMP_TO_EDGE
        expect(@tex.get 'wrap_t').toEqual GL_CLAMP_TO_EDGE
        expect(@tex.get 'generate_mipmap').toEqual false

    describe 'when width is set to non-pot value', ->
      beforeEach -> @tex.set 'width', 100
      itShouldBehaveLike 'non-power-of-two texture'

    describe 'when height is set to non-pot value', ->
      beforeEach -> @tex.set 'height', 100
      itShouldBehaveLike 'non-power-of-two texture'

    describe 'when a tex param changes', ->
      beforeEach ->
        @tex.forceValid()
        @tex.set 'min_filter', GL_LINEAR
      
      it 'should become invalid', ->
        expect(@tex).not.toBeValid()
