describe("Jax.Noise", function() {
  var noise, uniforms;
  
  beforeEach(function() {
    uniforms = { texture:function(name, tex, context) { }, set: function(name, value) { } };
    spyOn(uniforms, 'set');
    spyOn(uniforms, 'texture');
  });
  
  describe("initialized without a context", function() {
    beforeEach(function() { noise = new Jax.Noise(); });
    
    it("should not be prepared for use", function() {
      //because we never gave it a context to prepare against
      expect(noise.isPrepared(SPEC_CONTEXT)).toBeFalsy();
    });
    
    it("should bind to a uniform delegator and be prepared", function() {
      // is this too brittle?
      noise.bind(SPEC_CONTEXT, uniforms);
      expect(uniforms.texture).toHaveBeenCalledWith('permTexture',    noise.perm,    SPEC_CONTEXT);
      expect(uniforms.texture).toHaveBeenCalledWith('gradTexture',    noise.grad,    SPEC_CONTEXT);
      expect(uniforms.texture).toHaveBeenCalledWith('simplexTexture', noise.simplex, SPEC_CONTEXT);
      expect(noise.isPrepared(SPEC_CONTEXT)).toBeTruthy();
    });
  });
  
  describe("initialized old-style, with a context", function() {
    beforeEach(function() {
      noise = new Jax.Noise(SPEC_CONTEXT);
    });

    it("should be prepared for use", function() {
      expect(noise.isPrepared(SPEC_CONTEXT)).toBeTruthy();

      // make the same assertion with a dummy context, to make sure noise isn't lying about its preparedness
      var dummy_context = {id:-10};
      expect(noise.isPrepared(dummy_context)).toBeFalsy();
    });
    
    it("should bind to a uniform delegator and be prepared", function() {
      // is this too brittle?
      noise.bind(SPEC_CONTEXT, uniforms);
      expect(uniforms.texture).toHaveBeenCalledWith('permTexture',    noise.perm,    SPEC_CONTEXT);
      expect(uniforms.texture).toHaveBeenCalledWith('gradTexture',    noise.grad,    SPEC_CONTEXT);
      expect(uniforms.texture).toHaveBeenCalledWith('simplexTexture', noise.simplex, SPEC_CONTEXT);
      expect(noise.isPrepared(SPEC_CONTEXT)).toBeTruthy();
    });
  });
});
