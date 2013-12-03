describe 'Jax.Shader', ->
  beforeEach -> @program = new Jax.Shader

  program = null
  beforeEach ->
    @attr = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STREAM_DRAW, [1,2,3], 1, GL_FLOAT
    Jax.Shader.PopularityContest.reset()
    program = @program
    program.vertex.append 'void main(void) { gl_Position = vec4(0,0,0,0); }'
    program.fragment.append 'void main(void) { gl_FragColor = vec4(0,0,0,0); }'

  describe 'binding', ->
    beforeEach ->
      spyOn @context.renderer, 'useProgram'
      program.bind @context

    it 'should validate', ->
      expect(program).toBeValid @context

    it 'should use the program', ->
      expect(@context.renderer.useProgram).toHaveBeenCalled()

    it 'should not dispatch the same command twice in a row', ->
      @context.renderer.useProgram.reset()
      program.bind @context
      expect(@context.renderer.useProgram).not.toHaveBeenCalled()

    it 'should dispatch the command if the last bound program was a different program', ->
      prog2 = new Jax.Shader
      prog2.bind @context
      @context.renderer.useProgram.reset()
      program.bind @context
      expect(@context.renderer.useProgram).toHaveBeenCalled()

  describe 'assigning attribute variables', ->
    beforeEach ->
      spyOn(@context.renderer, 'getProgramParameter').andReturn 1
      spyOn(@context.renderer, 'getActiveAttrib').andReturn
        name: 'f'
        type: GL_FLOAT
      program.vertex.append 'attribute float f;'
      program.bind @context

    it 'should bind the variable stored in an attribute slot', ->
      spyOn(@attr, 'bind').andCallThrough()
      program.set @context, f: @attr
      expect(@attr.bind).toHaveBeenCalledWith @context

    it 'should set the vertex pointer', ->
      spyOn @context.renderer, 'vertexAttribPointer'
      program.set @context, f: @attr
      expect(@context.renderer.vertexAttribPointer).toHaveBeenCalledWith 0, 1, GL_FLOAT, false, 0, 0

    it 'should disable unused attributes', ->
      spyOn @context.renderer, 'disableVertexAttribArray'
      program.set @context, {}
      expect(@context.renderer.disableVertexAttribArray).toHaveBeenCalledWith 0

  describe 'assigning uniform variables', ->
    beforeEach ->
      @stub = (name, type, method) =>
        spyOn(@context.renderer, 'getActiveUniform').andReturn
          name: name
          type: type
        spyOn(@context.renderer, 'getUniformLocation').andReturn 0
        program.bind @context
        spyOn @context.renderer, method

    it 'float', ->
      @stub 'f', GL_FLOAT, 'uniform1f'
      program.set @context, f: 1.5
      expect(@context.renderer.uniform1f).toHaveBeenCalledWith 0, 1.5

    it 'bool', ->
      @stub 'f', GL_BOOL, 'uniform1i'
      program.set @context, f: true
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 0, true

    it 'int', ->
      @stub 'f', GL_INT, 'uniform1i'
      program.set @context, f: 1
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 0, 1

    it 'vec2', ->
      @stub 'f', GL_FLOAT_VEC2, 'uniform2fv'
      program.set @context, f: [1, 2]
      expect(@context.renderer.uniform2fv).toHaveBeenCalledWith 0, [1, 2]

    it 'vec3', ->
      @stub 'f', GL_FLOAT_VEC3, 'uniform3fv'
      program.set @context, f: [1, 2, 3]
      expect(@context.renderer.uniform3fv).toHaveBeenCalledWith 0, [1, 2, 3]

    it 'vec4', ->
      @stub 'f', GL_FLOAT_VEC4, 'uniform4fv'
      program.set @context, f: [1, 2, 3, 4]
      expect(@context.renderer.uniform4fv).toHaveBeenCalledWith 0, [1, 2, 3, 4]

    it 'bvec2', ->
      @stub 'f', GL_BOOL_VEC2, 'uniform2iv'
      program.set @context, f: [true, false]
      expect(@context.renderer.uniform2iv).toHaveBeenCalledWith 0, [true, false]

    it 'bvec3', ->
      @stub 'f', GL_BOOL_VEC3, 'uniform3iv'
      program.set @context, f: [true, false, true]
      expect(@context.renderer.uniform3iv).toHaveBeenCalledWith 0, [true, false, true]

    it 'bvec4', ->
      @stub 'f', GL_BOOL_VEC4, 'uniform4iv'
      program.set @context, f: [true, false, true, false]
      expect(@context.renderer.uniform4iv).toHaveBeenCalledWith 0, [true, false, true, false]

    it 'ivec2', ->
      @stub 'f', GL_INT_VEC2, 'uniform2iv'
      program.set @context, f: [0, 1]
      expect(@context.renderer.uniform2iv).toHaveBeenCalledWith 0, [0, 1]

    it 'ivec3', ->
      @stub 'f', GL_INT_VEC3, 'uniform3iv'
      program.set @context, f: [0, 1, 2]
      expect(@context.renderer.uniform3iv).toHaveBeenCalledWith 0, [0, 1, 2]

    it 'ivec4', ->
      @stub 'f', GL_INT_VEC4, 'uniform4iv'
      program.set @context, f: [0, 1, 2, 3]
      expect(@context.renderer.uniform4iv).toHaveBeenCalledWith 0, [0, 1, 2, 3]

    it 'sampler2D', ->
      @stub 'f', GL_SAMPLER_2D, 'uniform1i'
      program.set @context, f: new Jax.Texture
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 0, 0

    it 'samplerCube', ->
      @stub 'f', GL_SAMPLER_CUBE, 'uniform1i'
      program.set @context, f: new Jax.Texture.CubeMap
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 0, 0

    it 'mat2', ->
      mat = mat2.create()
      @stub 'f', GL_FLOAT_MAT2, 'uniformMatrix2fv'
      program.set @context, f: mat
      expect(@context.renderer.uniformMatrix2fv).toHaveBeenCalledWith 0, false, mat

    it 'mat3', ->
      mat = mat3.create()
      @stub 'f', GL_FLOAT_MAT3, 'uniformMatrix3fv'
      program.set @context, f: mat
      expect(@context.renderer.uniformMatrix3fv).toHaveBeenCalledWith 0, false, mat

    it 'mat4', ->
      mat = mat4.create()
      @stub 'f', GL_FLOAT_MAT4, 'uniformMatrix4fv'
      program.set @context, f: mat
      expect(@context.renderer.uniformMatrix4fv).toHaveBeenCalledWith 0, false, mat

  # describe 'when there are multiple instances using similar variable names', ->
  #   beforeEach ->
  #     program = new Jax.Shader
  #     @prog2 = new Jax.Shader
  #     program.vertex.append "attribute float b, a;"
  #     @prog2.vertex.append "attribute float a, c;"
  #     # spyOn(@context.renderer, 'getProgramParameter').andReturn 2
  #     # spyOn(@context.renderer, 'getActiveAttrib').andReturn
  #     #   name: 'f'
  #     #   type: GL_FLOAT

  #   describe 'binding', ->
  #     beforeEach ->
  #       spyOn @context.renderer, 'bindAttribLocation'
  #       spyOn @context.renderer, 'enableVertexAttribArray'
  #       program.bind @context
  #       @prog2.bind @context
  #       program.variables.attributes.definitions.push 'b', 'a'
  #       program.variables.attributes.b = name: 'b', type: GL_FLOAT, location: 1
  #       program.variables.attributes.a = name: 'a', type: GL_FLOAT, location: 2
  #       @prog2.variables.attributes.definitions.push 'a', 'c'
  #       @prog2.variables.attributes.b = name: 'a', type: GL_FLOAT, location: 2
  #       @prog2.variables.attributes.a = name: 'c', type: GL_FLOAT, location: 3

  #     describe 'and then disabling the common attribute', ->
  #       beforeEach -> program.set @context, { a: undefined, b: @attr }

  #       it 'should reevaluate bindings so that the less common but enabled attribute uses slot 0', ->
  #         expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 1, 'a'
  #         expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 0, 'b'

  #     it 'should bind the most popular variable name to slot 0', ->
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 0, 'a'

  #     it 'should bind the less popular variable name to slot 1', ->
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 1, 'b'

  #     it 'setting both with a value should enable both attribute locations', ->
  #       program.set @context,
  #         a: @attr
  #         b: @attr
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 0
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 1

  # describe "when variables are matrices", ->
  #   beforeEach ->
  #     program.vertex.append "attribute mat2 m2;"
  #     program.vertex.append "attribute mat3 m3;"
  #     program.vertex.append "attribute mat4 m4;"
  #     program.vertex.append "attribute float z;"

  #   describe 'binding and setting each with a value', ->
  #     beforeEach ->
  #       spyOn @context.renderer, 'bindAttribLocation'
  #       spyOn @context.renderer, 'enableVertexAttribArray'
  #       program.bind @context
  #       program.set @context,
  #         m2: @attr
  #         m3: @attr
  #         m4: @attr
  #         z: @attr

  #     it 'should pad attribute locations depending on matrix type', ->
  #       p = program.getGLProgram @context
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,0,'m2'
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,2,'m3'
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,5,'m4'
  #       expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,9,'z'
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 0
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 2
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 5
  #       expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 9

  it 'should be given a default name', ->
    expect(program.name).not.toBeBlank()

  describe 'after validation', ->
    beforeEach -> program.validate @context

    it 'should be valid with the same context', ->
      expect(program).toBeValid @context

    it 'should not be valid with a different context', ->
      expect(program).not.toBeValid new Jax.Context({canvas: document.createElement('canvas')})

    describe 'with multiple contexts', ->
      beforeEach ->
        @otherContext = new Jax.Context @context.canvas
        program.validate @otherContext

      describe 'invalidation with another context', ->
        beforeEach -> program.invalidate @otherContext

        it 'should be valid with the original context', ->
          expect(program).toBeValid @context

        it 'should not be valid with the other context', ->
          expect(program).not.toBeValid @otherContext

      describe "invalidation with no arguments", ->
        beforeEach -> program.invalidate()

        it 'should invalidate all contexts', ->
          expect(program).not.toBeValid @context
          expect(program).not.toBeValid @otherContext

    describe "when its vertex shader source changes", ->
      beforeEach ->
        program.vertex.append '//'

      it 'should be invalid', ->
        expect(program).not.toBeValid @context

    describe "when its fragment shader source changes", ->
      beforeEach ->
        program.fragment.append '//'

      it 'should be invalid', ->
        expect(program).not.toBeValid @context
