describe "Jax.Noise", ->
  noise = uniforms = null
  
  beforeEach ->
    uniforms = texture: ((name, tex, context) ->), set: ((name, value) ->)
    spyOn uniforms, 'set'
    spyOn uniforms, 'texture'
  
  describe "initialized without a context", ->
    beforeEach -> noise = new Jax.Noise
    
    it "should not be prepared for use", ->
      # because we never gave it a context to prepare against
      expect(noise.isPrepared SPEC_CONTEXT).toBeFalsy()
      
    it "should bind to a uniform delegator and be prepared", ->
      # is this too brittle?
      noise.bind SPEC_CONTEXT, uniforms
      expect(uniforms.gradTexture).toBe noise.grad
      expect(noise.isPrepared SPEC_CONTEXT).toBeTruthy()

  describe "initialized old-style, with a context", ->
    beforeEach -> noise = new Jax.Noise SPEC_CONTEXT
    
    it "should be prepared for use", ->
      expect(noise.isPrepared SPEC_CONTEXT).toBeTruthy()

      # make the same assertion with a dummy context, to make sure noise isn't lying about its preparedness
      dummy_context = id: -10
      expect(noise.isPrepared dummy_context).toBeFalsy()
    
    it "should bind to a uniform delegator and be prepared", ->
      # is this too brittle?
      noise.bind(SPEC_CONTEXT, uniforms);
      expect(uniforms.gradTexture).toBe noise.grad
      expect(noise.isPrepared SPEC_CONTEXT).toBeTruthy()
