describe "Jax.Shader2.Program", ->
  program = null
  beforeEach ->
    program = new Jax.Shader2.Program
  
  describe "given multiple appended copies of the same shared variable", ->
    beforeEach ->
      program.vertex.append "shared attribute vec4 POSITION;"
      program.vertex.append "shared attribute vec4 POSITION;"
      
    it "should compile", ->
      expect(-> program.compile SPEC_CONTEXT).not.toThrow()

  describe "with a valid vertex and fragment pair", ->
    beforeEach ->
      program.vertex.append """
        shared uniform mat4 mvMatrix;
        shared attribute vec4 position;
        shared varying vec4 color;
        void main(void) {
          color = vec4(1);
          gl_Position = mvMatrix * position;
        }
      """
      program.fragment.append """
        shared varying vec4 color;
        void main(void) { gl_FragColor = vec4(1,1,1,1); }
      """
      
    describe "after binding", ->
      beforeEach -> program.bind SPEC_CONTEXT
      
      it "should discover attributes", ->
        expect(program.discoverAttribute(SPEC_CONTEXT, 'position').type).toEqual GL_FLOAT_VEC4
      # it "should detect uniform variable types", ->
      #   expect(program.variables[SPEC_CONTEXT.id].mvMatrix.type).toEqual 'mat4'
      #     
      # it "should detect attribute variable types", ->
      #   expect(program.variables[SPEC_CONTEXT.id].position.type).toEqual 'vec4'
      # 
      # it "should detect uniform variable qualifiers", ->
      #   expect(program.variables[SPEC_CONTEXT.id].mvMatrix.qualifier).toEqual 'uniform'
      # 
      # it "should detect attribute variable qualifiers", ->
      #   expect(program.variables[SPEC_CONTEXT.id].position.qualifier).toEqual 'attribute'
      
    it "should compile when initially bound", ->
      spyOn(SPEC_CONTEXT.gl, 'linkProgram').andCallThrough()
      program.bind SPEC_CONTEXT
      expect(SPEC_CONTEXT.gl.linkProgram).toHaveBeenCalled()
    
    it "should use the GL program", ->
      spyOn SPEC_CONTEXT.gl, 'useProgram'
      program.bind SPEC_CONTEXT
      expect(SPEC_CONTEXT.gl.useProgram).toHaveBeenCalled()

    describe "after compiling", ->
      beforeEach -> program.compile SPEC_CONTEXT
      
      it "should not recompile when binding", ->
        spyOn SPEC_CONTEXT.gl, 'linkProgram'
        program.bind SPEC_CONTEXT
        expect(SPEC_CONTEXT.gl.linkProgram).not.toHaveBeenCalled()

      it "should use the GL program", ->
        spyOn SPEC_CONTEXT.gl, 'useProgram'
        program.bind SPEC_CONTEXT
        expect(SPEC_CONTEXT.gl.useProgram).toHaveBeenCalled()
