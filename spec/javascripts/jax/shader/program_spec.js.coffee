describe "Jax.Shader.Program", ->
  program = null
  beforeEach ->
    program = new Jax.Shader.Program
    
  describe "after having been compiled", ->
    beforeEach -> program.compile @context
    
    it "should compile again if its fragment source changes", ->
      spyOn program, 'compile'
      program.fragment.append '//'
      program.bind @context
      expect(program.compile).toHaveBeenCalled()
    
    it "should compile again if its vertex source changes", ->
      spyOn program, 'compile'
      program.vertex.append '//'
      program.bind @context
      expect(program.compile).toHaveBeenCalled()

  # Specs for shader recycling are disabled because the funcitonality is too,
  # it proved too slow to initialize (though effective once initialized). May
  # revisit this with Web Workers in v3.1+.
  describe "compiling two different programs with identical sources", ->
    program2 = null
    beforeEach ->
      vcode = 'void main(void) { gl_Position = vec4(1); }'
      fcode = 'void main(void) { gl_FragColor = vec4(1); }'
      program.vertex.append vcode
      program.fragment.append fcode
      program2 = new Jax.Shader.Program
      program2.vertex.append vcode
      program2.fragment.append fcode
      
    xit 'sanity check', ->
      expect(program.vertex).not.toBe program2.vertex
      expect(program.fragment).not.toBe program2.fragment
      expect(program.glShader(@context).program).toBe program.glShader(@context).program
      expect(program.glShader(@context).vertex).toBe program.glShader(@context).vertex
      expect(program.glShader(@context).fragment).toBe program.glShader(@context).fragment
    
    xit 'should produce the same GL program', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).program).toBe program2.glShader(@context).program
      
    xit 'should produce the same GL vertex shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).vertex).toBe program2.glShader(@context).vertex
      
    xit 'should produce the same GL fragment shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).fragment).toBe program2.glShader(@context).fragment
  
  describe "compiling two programs with identical vertex and differring fragment", ->
    program2 = null
    beforeEach ->
      vcode = 'void main(void) { gl_Position = vec4(1); }'
      program.vertex.append vcode
      program.fragment.append 'void main(void) { gl_FragColor = vec4(1); }'
      program2 = new Jax.Shader.Program
      program2.vertex.append vcode
      program2.fragment.append 'void main(void) { gl_FragColor = vec4(2); }'

    xit 'should produce a different GL program', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).program).not.toBe program2.glShader(@context).program

    xit 'should produce the same GL vertex shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).vertex).toBe program2.glShader(@context).vertex

    xit 'should produce a different GL fragment shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).fragment).not.toBe program2.glShader(@context).fragment
      
  describe "compiling two programs with different vertex and identical fragment", ->
    program2 = null
    beforeEach ->
      fcode = 'void main(void) { gl_FragColor = vec4(1); }'
      program.vertex.append  'void main(void) { gl_Position = vec4(1); }'
      program.fragment.append fcode
      program2 = new Jax.Shader.Program
      program2.vertex.append 'void main(void) { gl_Position = vec4(2); }'
      program2.fragment.append fcode

    xit 'should produce a different GL program', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).program).not.toBe program2.glShader(@context).program

    xit 'should produce a different GL vertex shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).vertex).not.toBe program2.glShader(@context).vertex

    xit 'should produce the same GL fragment shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).fragment).toBe program2.glShader(@context).fragment
      
  describe "compiling two programs with different vertex and fragment", ->
    program2 = null
    beforeEach ->
      program.vertex.append    'void main(void) { gl_Position = vec4(1); }'
      program.fragment.append  'void main(void) { gl_FragColor = vec4(1); }'
      program2 = new Jax.Shader.Program
      program2.vertex.append   'void main(void) { gl_Position = vec4(2); }'
      program2.fragment.append 'void main(void) { gl_FragColor = vec4(2); }'

    xit 'should produce a different GL program', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).program).not.toBe program2.glShader(@context).program

    xit 'should produce a different GL vertex shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).vertex).not.toBe program2.glShader(@context).vertex

    xit 'should produce the same GL fragment shader', ->
      program.compile @context
      program2.compile @context
      expect(program.glShader(@context).fragment).not.toBe program2.glShader(@context).fragment

  it "should bind textures and auto increment texture index", ->
    tex1 = new Jax.Texture(path: "/textures/rock.png")
    tex2 = new Jax.Texture(path: "/textures/rock.png")
    
    waitsFor ->
      if tex1.loaded and tex2.loaded
        program.fragment.append """
          shared uniform sampler2D Tex1, Tex2;
          void main(void) { gl_FragColor = texture2D(Tex1, vec2(1)) * texture2D(Tex2, vec2(1)); }
        """

        spyOn(SPEC_CONTEXT.gl, 'activeTexture').andCallThrough()
        spyOn(SPEC_CONTEXT.gl, 'bindTexture').andCallThrough()
        spyOn(SPEC_CONTEXT.gl, 'uniform1i').andCallThrough()

        program.bind SPEC_CONTEXT
        variables = program.discoverVariables SPEC_CONTEXT
        program.set SPEC_CONTEXT,
          Tex1: tex1
          Tex2: tex2
          
        expect(SPEC_CONTEXT.gl.activeTexture).toHaveBeenCalledWith(GL_TEXTURE0)
        expect(SPEC_CONTEXT.gl.bindTexture).toHaveBeenCalledWith(GL_TEXTURE_2D, tex1.getHandle(SPEC_CONTEXT))
        expect(SPEC_CONTEXT.gl.uniform1i).toHaveBeenCalledWith(variables['Tex1'].location, 0)

        expect(SPEC_CONTEXT.gl.activeTexture).toHaveBeenCalledWith(GL_TEXTURE1)
        expect(SPEC_CONTEXT.gl.bindTexture).toHaveBeenCalledWith(GL_TEXTURE_2D, tex2.getHandle(SPEC_CONTEXT))
        expect(SPEC_CONTEXT.gl.uniform1i).toHaveBeenCalledWith(variables['Tex2'].location, 1)

        return true
      false

  describe "given multiple appended copies of the same shared variable", ->
    beforeEach ->
      program.vertex.append "shared attribute vec4 POSITION;"
      program.vertex.append "shared attribute vec4 POSITION;"
      
    it "should compile", ->
      expect(-> program.compile SPEC_CONTEXT).not.toThrow()
      
  describe "with no source code", ->
    # this is because the shader is crashing the GPU on my machine,
    # and I suspect an empty main() is leaving gl_Position / gl_FragColor
    # as undefined. (Is that possible?)
    
    beforeEach -> program.compile SPEC_CONTEXT
    
    it "should set an arbitrary vertex position", ->
      expect(program.vertex.toString()).toMatch /gl_Position = vec4/

    it "should set an arbitrary fragment color", ->
      expect(program.fragment.toString()).toMatch /gl_FragColor = vec4/

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
        expect(program.discoverVariables(SPEC_CONTEXT).position.type).toEqual GL_FLOAT_VEC4
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
