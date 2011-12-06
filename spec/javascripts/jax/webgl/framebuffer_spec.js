describe("Framebuffer", function() {
  var buf;
  
  it("should return the first texture if index not given (issue #30)", function() {
    // https://github.com/sinisterchipmunk/jax/issues/30
    buf = new Jax.Framebuffer();
    expect(buf.getTexture(SPEC_CONTEXT)).toBeTruthy();
    expect(buf.getTexture(SPEC_CONTEXT)).toBe(buf.getTexture(SPEC_CONTEXT, 0));
  });
  
  describe("with no attachments", function() {
    beforeEach(function() { buf = new Jax.Framebuffer(); });
    
    it("should bind", function() {
      // because there's a default GL_RGBA color profile generated.
      // This was the only way to circumvent an unknown error in FF and Chrome when
      // using a depth buffer only.
      expect(function() {buf.bind(SPEC_CONTEXT)}).not.toThrow();
    });
  });
  
  describe("with only a depth attachment", function() {
    beforeEach(function() {
      buf = new Jax.Framebuffer({ depth: true });
    });
    
    it("should bind", function() {
      expect(function() {buf.bind(SPEC_CONTEXT)}).not.toThrow();
    });
  });
  
  describe("with only a stencil attachment", function() {
    beforeEach(function() {
      buf = new Jax.Framebuffer({ stencil: true });
    });
    
    xit("should bind", function() { // raising GL_FRAMEBUFFER_UNSUPPORTED
      expect(function() {buf.bind(SPEC_CONTEXT)}).not.toThrow();
    });
  });

  describe("with a depth and a stencil attachment", function() {
    beforeEach(function() {
      buf = new Jax.Framebuffer({ depth: true, stencil: true });
    });
    
    it("should bind", function() {
      expect(function() {buf.bind(SPEC_CONTEXT)}).not.toThrow();
    });
  });
});