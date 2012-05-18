describe "Jax.Shader2.Program", ->
  program = null
  beforeEach ->
    program = new Jax.Shader2.Program SPEC_CONTEXT.gl
  
  describe "with a valid vertex and fragment pair", ->
    beforeEach ->
      program.vertex.append """
        shared uniform mat4 mvMatrix;
        shared attribute vec4 position;
        shared varying vec4 color;
        void main(void) { color = vec4(1); gl_Position = vec4(1,1,1,1); }
      """
      program.fragment.append """
        shared varying vec4 color;
        void main(void) { gl_FragColor = vec4(1,1,1,1); }
      """
      
    it "should compile when initially bound", ->
      spyOn(SPEC_CONTEXT.gl, 'linkProgram').andCallThrough()
      program.bind()
      expect(SPEC_CONTEXT.gl.linkProgram).toHaveBeenCalled()
    
    it "should use the GL program", ->
      spyOn SPEC_CONTEXT.gl, 'useProgram'
      program.bind()
      expect(SPEC_CONTEXT.gl.useProgram).toHaveBeenCalled()

    describe "after compiling", ->
      beforeEach -> program.compile SPEC_CONTEXT
      
      it "should not recompile when binding", ->
        spyOn SPEC_CONTEXT.gl, 'linkProgram'
        program.bind()
        expect(SPEC_CONTEXT.gl.linkProgram).not.toHaveBeenCalled()

      it "should use the GL program", ->
        spyOn SPEC_CONTEXT.gl, 'useProgram'
        program.bind()
        expect(SPEC_CONTEXT.gl.useProgram).toHaveBeenCalled()
