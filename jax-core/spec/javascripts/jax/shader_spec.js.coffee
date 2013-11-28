#= require jax/shader/dsl_spec

describe 'Jax.Shader', ->
  beforeEach -> @program = new Jax.Shader

  it 'smt', ->
    surface = @program

    surface.code 'top', """
      void VertexPosition(inout vec3 position, mat4 modelViewMatrix);
      void VertexNormal(inout vec3 normal, mat3 normalMatrix);
      void RenormalizeNormal(inout vec3 normal);
      vec3 LambertDiffuse(float materialDiffuseIntensity,
                          vec3 materialDiffuseColor,
                          vec3 eyeSpaceSurfaceNormal,
                          vec3 eyeSpaceLightDirection,
                          int lightType,
                          int lightSpotInnerCos,
                          int lightSpotOuterCos,
                          vec3 lightDiffuseColor,
                          out vec3 diffuseColor,
                          out float spotAttenuation,
                          out float lightDistanceFromSurface);
      void LightAttenuation(inout vec3 color,
                            float lightDistanceFromSurface,
                            float spotAttenuation,
                            float constantAttenuation,
                            float linearAttenuation,
                            float quadraticAttenuation);
    """

    surface.attributes
      vec4: 'vertexPosition'
      vec3: 'vertexNormal'
    surface.uniforms
      mat4: 'modelViewMatrix'
      mat3: 'normalMatrix'
      int: ['numLights', 'lightType[numLights]']
      vec3: [ 'lightDirection[numLights]',
              'materialDiffuseColor',
              'lightDiffuseColor[numLights]' ]
      float: [ 'materialDiffuseIntensity',
               'lightSpotInnerCos[numLights]',
               'lightSpotOuterCos[numLights]',
               'lightConstantAttenuation[numLights]',
               'lightLinearAttenuation[numLights]',
               'lightQuadratictAttenuation[numLights]' ]
    surface.varyings
      vec3: ['eyeSpaceNormal', 'eyeSpacePosition']

    surface.vertexShader (vert) ->
      { attributes, uniforms, varyings, VertexPosition, VertexNormal } = vert
      vert.VertexPosition
        position:        attributes.vertexPosition
        modelViewMatrix: uniforms.modelViewMatrix
      vert.VertexNormal
        normal:          attributes.vertexNormal
        normalMatrix:    uniforms.normalMatrix
      vert.set varyings.eyeSpacePosition, VertexPosition.position
      vert.set varyings.eyeSpaceNormal,   VertexNormal.normal
      vert.multiply 'gl_Position', 'pMatrix', VertexPosition.position

    surface.fragmentShader (frag) ->
      { attributes, uniforms, varyings } = frag
      { RenormalizeNormal, LambertDiffuse, LightAttenuation } = frag
      frag.set 'gl_FragColor', 'vec4(0.0, 0.0, 0.0, 1.0)'
      frag.RenormalizeNormal normal: varyings.eyeSpaceNormal
      frag.iterate 'numLights', (iter) ->
        iter.LambertDiffuse
          materialDiffuseIntensity: uniforms.materialDiffuseIntensity
          materialDiffuseColor:     uniforms.materialDiffuseColor
          eyeSpaceSurfaceNormal:    RenormalizeNormal.normal
          eyeSpaceLightDirection:   uniforms.lightDirection[iter]
          lightType:                uniforms.lightType[iter]
          lightSpotInnerCos:        uniforms.lightSpotInnerCos[iter]
          lightSpotOuterCos:        uniforms.lightSpotOuterCos[iter]
          lightDiffuseColor:        uniforms.lightDiffuseColor[iter]
        iter.LightAttenuation
          color:                    LambertDiffuse.diffuseColor
          lightDistanceFromSurface: LambertDiffuse.lightDistanceFromSurface
          spotAttenuation:          LambertDiffuse.spotAttenuation
          constantAttenuation:      uniforms.lightConstantAttenuation[iter]
          linearAttenuation:        uniforms.lightLinearAttenuation[iter]
          quadraticAttenuation:     uniforms.lightQuadratictAttenuation[iter]
        iter.add 'gl_FragColor.rgb', LightAttenuation.color

    console.log surface.generate().vertex.toString()
    console.log surface.generate().fragment.toString()
    # console.log surface.vertexShader().commands

  describe 'vertex shader', ->
    beforeEach -> @program.vertexShader (shader) => @shader = shader
    itShouldBehaveLike "a shader"

    it 'should have an attributes object', ->
      expect(@shader.attributes).not.toBeUndefined()

  describe 'fragment shader', ->
    beforeEach -> @program.fragmentShader (shader) => @shader = shader
    itShouldBehaveLike "a shader"
    it 'should not have an attributes object', ->
      expect(@shader.attributes).toBeUndefined()

  describe 'uniforms', ->
    beforeEach ->
      @program.uniforms
        mat4: [ 'modelViewMatrix', 'projectionMatrix' ]
        mat3: 'normalMatrix'
      @vertexSource = @program.generate().vertex.toString()
      @fragmentSource = @program.generate().fragment.toString()

    it 'should generate namespaced vertex uniform definitions', ->
      expect(@vertexSource).toMatch /uniform mat4 U_modelViewMatrix,[\s\t\n]*U_projectionMatrix;/
      expect(@vertexSource).toInclude 'uniform mat3 U_normalMatrix;'

    it 'should generate namespaced fragment uniform definitions', ->
      expect(@fragmentSource).toMatch /uniform mat4 U_modelViewMatrix,[\t\s\n]*U_projectionMatrix;/
      expect(@fragmentSource).toInclude 'uniform mat3 U_normalMatrix;'

  describe 'varyings', ->
    beforeEach ->
      @program.varyings
        float: [ 'a', 'b' ]
        vec3: 'normal'
      @vertexSource = @program.generate().vertex.toString()
      @fragmentSource = @program.generate().fragment.toString()

    it 'should generate namespaced vertex varying definitions', ->
      expect(@vertexSource).toMatch /varying float V_a,[\s\t\n]*V_b;/
      expect(@vertexSource).toInclude 'varying vec3 V_normal;'

    it 'should generate namespaced fragment varying definitions', ->
      expect(@vertexSource).toMatch /varying float V_a,[\s\t\n]*V_b;/
      expect(@vertexSource).toInclude 'varying vec3 V_normal;'

  describe 'attributes', ->
    beforeEach ->
      @program.attributes
        vec4: [ 'position', 'color' ]
        vec3: 'normal'
      @vertexSource = @program.generate().vertex.toString()
      @fragmentSource = @program.generate().fragment.toString()

    it 'should generate namespaced vertex attribute definitions', ->
      expect(@vertexSource).toMatch /attribute vec4 A_position/
      expect(@vertexSource).toInclude 'attribute vec3 A_normal;'

    # fragment shaders can't contain attributes.
    it 'should not generate fragment attribute definitions', ->
      expect(@fragmentSource).not.toMatch /position|color|normal/
      
  describe 'program', ->
    program = null
    beforeEach ->
      @attr = new Jax.Buffer GL_ARRAY_BUFFER, Float32Array, GL_STREAM_DRAW, [1,2,3], 1, GL_FLOAT
      Jax.Shader.resetPopularities()
      program = new Jax.Shader

    xit 'should have a default vertex shader output', ->
      expect(program.vertex.toString()).toMatch /gl_Position = vec4\(1\.0, 1\.0, 1\.0, 1\.0\);/

    xit 'should have a default fragment shader output', ->
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
        prog2 = new Jax.Shader
        prog2.bind @context
        @context.renderer.useProgram.reset()
        program.bind @context
        expect(@context.renderer.useProgram).toHaveBeenCalled()

    describe 'assigning attribute variables', ->
      beforeEach ->
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
        program.vertex.append '''
        uniform float f;
        uniform bool  b;
        uniform int   i;
        uniform vec2  v2;
        uniform vec3  v3;
        uniform vec4  v4;
        uniform bvec2 bv2;
        uniform bvec3 bv3;
        uniform bvec4 bv4;
        uniform ivec2 iv2;
        uniform ivec3 iv3;
        uniform ivec4 iv4;
        uniform sampler2D s2d;
        uniform samplerCube scube;
        uniform mat2 m2;
        uniform mat3 m3;
        uniform mat4 m4;
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
          s2d: new Jax.Texture
          scube: new Jax.Texture
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
        program = new Jax.Shader
        @prog2 = new Jax.Shader
        program.vertex.append "attribute float b, a;"
        @prog2.vertex.append "attribute float a, c;"

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
        program.vertex.append "attribute mat2 m2;"
        program.vertex.append "attribute mat3 m3;"
        program.vertex.append "attribute mat4 m4;"
        program.vertex.append "attribute float z;"

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
      beforeEach -> program = new Jax.Shader "new name"

      it 'should use the name', ->
        expect(program.name).toEqual 'new name'

    it 'should be given a default name', ->
      expect(program.name).not.toBeBlank()

    describe 'with a uniform float', ->
      beforeEach ->
        program.vertex.append 'uniform float f;'
        # we must "use" the uniform to prevent it being optimized away
        # when a real WebGL context is used (e.g. in-browser testing).
        program.vertex.code 'main', 'gl_Position = vec4(f, f, f, f);'
        program.validate @context

      it 'should detect the variable', ->
        expect(program.variables.uniforms['f'].type).toEqual 'float'

      it 'should detect the variable name', ->
        expect(program.variables.uniforms['f'].toString()).toEqual 'f'

    describe 'when a function precedes a variable declaration', ->
      beforeEach ->
        program.vertex.append 'void x() {\n}\nuniform float a;\n'
        program.validate @context

      it 'should not remove the function', ->
        expect(program.vertex.toString()).toMatch /void x/

    describe 'when a function precedes a variable declaration', ->
      beforeEach ->
        program.vertex.append 'void x() {\n}\nuniform float a;\n'
        program.validate @context

      it 'should not remove the function', ->
        expect(program.vertex.toString()).toMatch /void x/

      it 'should not remove the curly brace', ->
        expect(program.vertex.toString()).toMatch /\}/

    describe 'when there is a valid variable declaration commented out', ->
      beforeEach ->
        program.vertex.append "// attribute float a;\nattribute float b;"
        program.validate @context

      it 'should not detect the commented variable', ->
        expect(program.variables.attributes['a']).toBeUndefined()

      it 'should still detect the uncommented variable', ->
        expect(program.variables.attributes['b']).not.toBeUndefined()

    describe 'when there is a variable declaration in a multiline comment', ->
      beforeEach ->
        program.vertex.append "/*\nattribute float a;\n*/attribute float b;"
        program.validate @context

      it 'should not detect the commented variable', ->
        expect(program.variables.attributes['a']).toBeUndefined()

      it 'should still detect the uncommented variable', ->
        expect(program.variables.attributes['b']).not.toBeUndefined()

    describe 'with an attribute vec3', ->
      beforeEach ->
        program.vertex.append 'attribute vec3 a;'
        program.validate @context

      it 'should detect the variable', ->
        expect(program.variables.attributes['a'].type).toEqual 'vec3'

      it 'should detect the variable name', ->
        expect(program.variables.attributes['a'].toString()).toEqual 'a'

    describe 'with a varying vec3', ->
      beforeEach ->
        program.vertex.append 'varying vec3 a;'
        program.validate @context

      it 'should detect the variable', ->
        expect(program.variables.varyings['a'].type).toEqual 'vec3'

      it 'should detect the variable name', ->
        expect(program.variables.varyings['a'].toString()).toEqual 'a'

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
