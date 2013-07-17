describe 'Jax.Framebuffer', ->
  buf = null
  
  describe 'when OES_depth_texture is available', ->
    ###
    These tests will probably be removed entirely because they presume
    the depth texture should be used in place of a depth buffer, which is
    just wrong. See core/framebuffer.js for details.

    beforeEach ->
      ext = @context.gl.getExtension 'WEBKIT_WEBGL_depth_texture' || \
            @context.gl.getExtension 'MOZ_WEBGL_depth_texture'    || \
            @context.gl.getExtension 'WEBGL_depth_texture'
      spyOn(@context.gl, 'getExtension').andReturn ext || {}
      
    it 'should not bind a depth renderbuffer', ->
      spyOn(@context.gl, 'createRenderbuffer').andCallThrough()
      buf = new Jax.Framebuffer(depth: true)
      buf.bind @context
      expect(@context.gl.createRenderbuffer).not.toHaveBeenCalled()
    
    it 'should bind a depth texture', ->
      spyOn(@context.gl, 'texImage2D').andCallThrough()
      buf = new Jax.Framebuffer(depth: true)
      buf.bind @context
      [w, h] = [buf.options.width, buf.options.height]
      expect(@context.gl.texImage2D).toHaveBeenCalledWith(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, w, h, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, null)
    ###
  
  it "should return the first texture if index not given (issue #30)", ->
    # https://github.com/sinisterchipmunk/jax/issues/30
    buf = new Jax.Framebuffer();
    expect(buf.getTexture(@context)).toBeTruthy();
    expect(buf.getTexture(@context)).toBe(buf.getTexture(@context, 0));
  
  describe "with no attachments", ->
    beforeEach -> buf = new Jax.Framebuffer()
    
    it "should bind", ->
      # because there's a default GL_RGBA color profile generated.
      # This was the only way to circumvent an unknown error in FF and Chrome when
      # using a depth buffer only.
      expect(=> buf.bind(@context)).not.toThrow()

  describe "with only a depth attachment", ->
    beforeEach -> buf = new Jax.Framebuffer depth: true
    it "should bind", -> expect(=> buf.bind(@context)).not.toThrow()
  
  describe "with only a stencil attachment", ->
    beforeEach -> buf = new Jax.Framebuffer stencil: true
    xit "should bind", -> # raising GL_FRAMEBUFFER_UNSUPPORTED
      expect(=> buf.bind(@context)).not.toThrow()

  describe "with a depth and a stencil attachment", ->
    beforeEach -> buf = new Jax.Framebuffer depth: true, stencil: true
    it 'should bind', -> expect(=> buf.bind(@context)).not.toThrow()
