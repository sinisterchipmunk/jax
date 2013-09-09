describe "Jax.Shader.Program", ->
  program = null
  beforeEach ->
    @attr = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STREAM_DRAW, [1,2,3], 1, GL_FLOAT
    Jax.Shader.Program.resetPopularities()
    program = new Jax.Shader.Program

  it 'should have a default vertex shader output', ->
    expect(program.vertex.toString()).toMatch /gl_Position = vec4\(1\.0, 1\.0, 1\.0, 1\.0\);/

  it 'should have a default fragment shader output', ->
    expect(program.fragment.toString()).toMatch /gl_FragColor = vec4\(0\.0, 0\.0, 0\.0, 0\.0\);/
  
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
      prog2 = new Jax.Shader.Program
      prog2.bind @context
      @context.renderer.useProgram.reset()
      program.bind @context
      expect(@context.renderer.useProgram).toHaveBeenCalled()

  describe 'assigning attribute variables', ->
    beforeEach ->
      program.vertex.append 'shared attribute float f;'
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
      program.vertex.append '''
      shared uniform float f;
      shared uniform bool  b;
      shared uniform int   i;
      shared uniform vec2  v2;
      shared uniform vec3  v3;
      shared uniform vec4  v4;
      shared uniform bvec2 bv2;
      shared uniform bvec3 bv3;
      shared uniform bvec4 bv4;
      shared uniform ivec2 iv2;
      shared uniform ivec3 iv3;
      shared uniform ivec4 iv4;
      shared uniform sampler2D s2d;
      shared uniform samplerCube scube;
      shared uniform mat2 m2;
      shared uniform mat3 m3;
      shared uniform mat4 m4;
      '''
      spyOn(@context.renderer, 'getUniformLocation').andCallFake (p, name) ->
        switch name
          when 'f' then 0
          when 'b' then 1
          when 'i' then 2
          when 'v2' then 3
          when 'v3' then 4
          when 'v4' then 5
          when 'bv2' then 6
          when 'bv3' then 7
          when 'bv4' then 8
          when 'iv2' then 9
          when 'iv3' then 10
          when 'iv4' then 11
          when 's2d' then 12
          when 'scube' then 13
          when 'm2' then 14
          when 'm3' then 15
          when 'm4' then 16
          else throw new Error "Unexpected getUniformLocation: #{name}"
      program.bind @context
      spyOn @context.renderer, 'uniform1f'
      spyOn @context.renderer, 'uniform1i'
      spyOn @context.renderer, 'uniform2fv'
      spyOn @context.renderer, 'uniform3fv'
      spyOn @context.renderer, 'uniform4fv'
      spyOn @context.renderer, 'uniform2iv'
      spyOn @context.renderer, 'uniform3iv'
      spyOn @context.renderer, 'uniform4iv'
      spyOn @context.renderer, 'uniformMatrix2fv'
      spyOn @context.renderer, 'uniformMatrix3fv'
      spyOn @context.renderer, 'uniformMatrix4fv'
      program.set @context,
        f: 1.5
        b: true
        i: 1
        v2: [1, 2]
        v3: [1, 2, 3]
        v4: [1, 2, 3, 4]
        bv2: [true, false]
        bv3: [true, false, true]
        bv4: [true, false, true, false]
        iv2: [1, 2]
        iv3: [1, 2, 3]
        iv4: [1, 2, 3, 4]
        s2d: new Jax.Texture(width: 16, height: 16)
        scube: new Jax.Texture(width: 16, height: 16)
        m2: [1, 2, 3, 4]
        m3: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        m4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

    it 'should set the uniform variables as appropriate', ->
      expect(@context.renderer.uniform1f).toHaveBeenCalledWith 0, 1.5 # f
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 1, true # b
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 2, 1 # i
      expect(@context.renderer.uniform2fv).toHaveBeenCalledWith 3, [1, 2] # v2
      expect(@context.renderer.uniform3fv).toHaveBeenCalledWith 4, [1, 2, 3] # v3
      expect(@context.renderer.uniform4fv).toHaveBeenCalledWith 5, [1, 2, 3, 4] # v4
      expect(@context.renderer.uniform2iv).toHaveBeenCalledWith 6, [true, false] # bv2
      expect(@context.renderer.uniform3iv).toHaveBeenCalledWith 7, [true, false, true] # bv3
      expect(@context.renderer.uniform4iv).toHaveBeenCalledWith 8, [true, false, true, false] # bv4
      expect(@context.renderer.uniform2iv).toHaveBeenCalledWith 9, [1, 2] # iv2
      expect(@context.renderer.uniform3iv).toHaveBeenCalledWith 10, [1, 2, 3] # iv3
      expect(@context.renderer.uniform4iv).toHaveBeenCalledWith 11, [1, 2, 3, 4] # iv4
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 12, 0 # s2d
      expect(@context.renderer.uniform1i).toHaveBeenCalledWith 13, 1 # scube
      expect(@context.renderer.uniformMatrix2fv).toHaveBeenCalledWith 14, false, [1, 2, 3, 4] # m2
      expect(@context.renderer.uniformMatrix3fv).toHaveBeenCalledWith 15, false, [1, 2, 3, 4, 5, 6, 7, 8, 9] # m3
      expect(@context.renderer.uniformMatrix4fv).toHaveBeenCalledWith 16, false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] # m4

  describe 'when there are multiple instances using similar variable names', ->
    beforeEach ->
      program = new Jax.Shader.Program
      @prog2 = new Jax.Shader.Program
      program.vertex.append "shared attribute float b, a;"
      @prog2.vertex.append "shared attribute float a, c;"

    describe 'binding', ->
      beforeEach ->
        spyOn @context.renderer, 'bindAttribLocation'
        spyOn @context.renderer, 'enableVertexAttribArray'
        program.bind @context

      describe 'and then disabling the common attribute', ->
        beforeEach -> program.set @context, { a: undefined, b: @attr }

        it 'should reevaluate bindings so that the less common but enabled attribute uses slot 0', ->
          expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 1, 'a'
          expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 0, 'b'

      it 'should bind the most popular variable name to slot 0', ->
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 0, 'a'

      it 'should bind the less popular variable name to slot 1', ->
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith program.getGLProgram(@context), 1, 'b'

      it 'setting both with a value should enable both attribute locations', ->
        program.set @context,
          a: @attr
          b: @attr
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 0
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 1

  describe "when variables are matrices", ->
    beforeEach ->
      program.vertex.append "shared attribute mat2 m2;"
      program.vertex.append "shared attribute mat3 m3;"
      program.vertex.append "shared attribute mat4 m4;"
      program.vertex.append "shared attribute float z;"

    describe 'binding and setting each with a value', ->
      beforeEach ->
        spyOn @context.renderer, 'bindAttribLocation'
        spyOn @context.renderer, 'enableVertexAttribArray'
        program.bind @context
        program.set @context,
          m2: @attr
          m3: @attr
          m4: @attr
          z: @attr

      it 'should pad attribute locations depending on matrix type', ->
        p = program.getGLProgram @context
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,0,'m2'
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,2,'m3'
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,5,'m4'
        expect(@context.renderer.bindAttribLocation).toHaveBeenCalledWith p,9,'z'
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 0
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 2
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 5
        expect(@context.renderer.enableVertexAttribArray).toHaveBeenCalledWith 9

  describe "given a name", ->
    beforeEach -> program = new Jax.Shader.Program "new name"

    it 'should use the name', ->
      expect(program.name).toEqual 'new name'

  it 'should be given a default name', ->
    expect(program.name).not.toBeBlank()

  describe 'with a uniform float', ->
    beforeEach ->
      program.vertex.append 'shared uniform float f;'

    it 'should detect the variable', ->
      expect(program.variables.uniforms['f'].type).toEqual 'float'

    it 'should detect the variable name', ->
      expect(program.variables.uniforms['f'].name).toEqual 'f'

  describe 'when a function precedes a variable declaration', ->
    beforeEach ->
      program.vertex.append 'void x() {\n}\nshared uniform float a;\n'

    it 'should not remove the function', ->
      expect(program.vertex.toString()).toMatch /void x/

  describe 'when a shared function precedes a variable declaration', ->
    beforeEach ->
      program.vertex.append 'shared void x() {\n}\nshared uniform float a;\n'

    it 'should not remove the function', ->
      expect(program.vertex.toString()).toMatch /void x/

    it 'should not remove the curly brace', ->
      expect(program.vertex.toString()).toMatch /\}/

  describe 'when there is a valid variable declaration commented out', ->
    beforeEach ->
      program.vertex.append "// shared attribute float a;\nshared attribute float b;"

    it 'should not detect the commented variable', ->
      expect(program.variables.attributes['a']).toBeUndefined()

    it 'should still detect the uncommented variable', ->
      expect(program.variables.attributes['b']).not.toBeUndefined()

  describe 'when there is a variable declaration in a multiline comment', ->
    beforeEach ->
      program.vertex.append "/*\nshared attribute float a;\n*/shared attribute float b;"

    it 'should not detect the commented variable', ->
      expect(program.variables.attributes['a']).toBeUndefined()

    it 'should still detect the uncommented variable', ->
      expect(program.variables.attributes['b']).not.toBeUndefined()

  describe 'with an attribute vec3', ->
    beforeEach ->
      program.vertex.append 'shared attribute vec3 a;'

    it 'should detect the variable', ->
      expect(program.variables.attributes['a'].type).toEqual 'vec3'

    it 'should detect the variable name', ->
      expect(program.variables.attributes['a'].name).toEqual 'a'

  describe 'with a varying vec3', ->
    beforeEach ->
      program.vertex.append 'shared varying vec3 a;'

    it 'should detect the variable', ->
      expect(program.variables.varyings['a'].type).toEqual 'vec3'

    it 'should detect the variable name', ->
      expect(program.variables.varyings['a'].name).toEqual 'a'

  describe 'after validation', ->
    beforeEach -> program.validate @context

    it 'should be valid with the same context', ->
      expect(program).toBeValid @context

    it 'should not be valid with a different context', ->
      expect(program).not.toBeValid {}

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
      beforeEach -> program.vertex.append '//'

      it 'should be invalid', ->
        expect(program).not.toBeValid @context

    describe "when its fragment shader source changes", ->
      beforeEach -> program.fragment.append '//'

      it 'should be invalid', ->
        expect(program).not.toBeValid @context
