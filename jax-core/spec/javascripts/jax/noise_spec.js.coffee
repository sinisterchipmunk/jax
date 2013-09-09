describe "Jax.Noise", ->
  noise = uniforms = null
  
  beforeEach ->
    uniforms = texture: ((name, tex, context) ->), set: ((name, value) ->)
    spyOn uniforms, 'set'
    spyOn uniforms, 'texture'
  
  describe "initialized without a context", ->
    beforeEach -> noise = new Jax.Noise
    
    it "should bind to a uniform delegator", ->
      # is this too brittle?
      noise.bind SPEC_CONTEXT, uniforms
      expect(uniforms.gradTexture).toBe noise.grad

  describe "initialized old-style, with a context", ->
    beforeEach -> noise = new Jax.Noise SPEC_CONTEXT
    
    it "should bind to a uniform delegator", ->
      noise.bind(SPEC_CONTEXT, uniforms);
      expect(uniforms.gradTexture).toBe noise.grad
