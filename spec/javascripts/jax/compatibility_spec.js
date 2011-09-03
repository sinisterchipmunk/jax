describe("LCD Compatibility tests", function() {
  /* these tests verify that different aspects of Jax can perform on lowest-common-denominator machines */
  
  /*
    From the GL ES SL spec, section 7.8:
    
    //
    // Implementation dependent constants. The example values below
    // are the minimum values allowed for these maximums.
    //
        
    So, the "basic" shader must define no more than at most the above
    uniforms, varyings, etc. -- or else the basic shader itself may
    fail on some implementations!
    
    Jax will dynamically step back from other shader chain elements,
    but if the 'basic' shader exceeds these limits then Jax is out of
    the running entirely on some processors -- not good!
    
    TODO add some tests to validate 'basic' shader against the following:
      const mediump int gl_MaxVertexTextureImageUnits = 0;
      const mediump int gl_MaxCombinedTextureImageUnits = 8;
      const mediump int gl_MaxTextureImageUnits = 8;
      const mediump int gl_MaxDrawBuffers = 1;
  */
  describe("Basic shader", function() {
    var matr, shader;
    beforeEach(function() { matr = new Jax.Material(); shader = matr.prepareShader(); });
    
    it("should not have more than 16 uniforms", function() {
      // const mediump int gl_MaxVertexUniformVectors = 128;
      // const mediump int gl_MaxFragmentUniformVectors = 16;
      expect(shader.countUniforms(matr)).toBeLessThan(17);
    });
    
    it("should not have more than 8 varyings", function() {
      // const mediump int gl_MaxVaryingVectors = 8;
      expect(shader.countVaryings(matr)).toBeLessThan(9);
    });
    
    it("should not have more than 8 attribs", function() {
      // const mediump int gl_MaxVertexAttribs = 8;
      expect(shader.countAttributes(matr)).toBeLessThan(9);
    });
  });
});
