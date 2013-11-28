sharedExamplesFor "a shader", ->
  sharedExamplesFor "a shader block", ->
    it 'should multiply two params', ->
      @block.multiply 'a', 'b', 'c'
      expect(@block.toSource()).toInclude 'a = b * c;'

    it 'should multiply in place', ->
      @block.multiply 'a', 'b'
      expect(@block.toSource()).toInclude 'a *= b;'

    it 'should add two params', ->
      @block.add 'a', 'b', 'c'
      expect(@block.toSource()).toInclude 'a = b + c;'

    it 'should add in place', ->
      @block.add 'a', 'b'
      expect(@block.toSource()).toInclude 'a += b;'

    it 'should set', ->
      @block.set 'a', 'b'
      expect(@block.toSource()).toInclude 'a = b;'

    it 'should divide two params', ->
      @block.divide 'a', 'b', 'c'
      expect(@block.toSource()).toInclude 'a = b / c;'

    it 'should divide in place', ->
      @block.divide 'a', 'b'
      expect(@block.toSource()).toInclude 'a /= b;'

    it 'should subtract two params', ->
      @block.subtract 'a', 'b', 'c'
      expect(@block.toSource()).toInclude 'a = b - c;'

    it 'should subtract in place', ->
      @block.subtract 'a', 'b'
      expect(@block.toSource()).toInclude 'a -= b;'

    it 'should average N params', ->
      @block.average 'a', 'b'
      @block.average 'b', 'c', 'd'
      @block.average 'c', 'd', 'e', 'f'
      expect(@block.toSource()).toInclude 'a = b;'
      expect(@block.toSource()).toInclude 'b = (c + d) * 0.5;'
      expect(@block.toSource()).toInclude 'c = (d + e + f) * 0.333333;'

  beforeEach -> @block = @shader

  describe 'appending code', ->
    describe 'as a string', ->
      beforeEach -> @shader.code "this is source code"

      it 'should append the code verbatim', ->
        expect(@shader.toSource()).toInclude 'this is source code'

    describe 'as a function', ->
      beforeEach -> @shader.code -> "I was called"

      it 'should append the function after calling it', ->
        expect(@shader.toSource()).toInclude 'I was called'

    describe 'as a function at top level', ->
      beforeEach -> @shader.code 'top', -> "I was called"

      it 'should append the function after calling it', ->
        expect(@shader.toSource()).toMatch /I was called(.|\n)*main/

  describe 'with a uniform', ->
    beforeEach -> @shader.addUniforms int: 'x'

    describe 'adding methods', ->
      describe 'with return value', ->
        beforeEach -> @shader.code 'top', 'int helper();'

        it 'should create a variable to capture the result when called', ->
          @shader.helper()
          expect(@shader.toString()).toInclude 'int helper_result'

        describe 'when a variable is mapped to the result', ->
          beforeEach -> 
            @shader.helper result: @shader.uniforms.x

          it 'should not create a new variable', ->
            expect(@shader.toString()).not.toInclude 'int helper_result'

          it 'should assign the output accordingly', ->
            # it would be invalid to assign to a uniform but our job is not
            # to validate, only to generate accurately
            expect(@shader.toString()).toInclude 'U_x = helper'

      describe 'with no qualifier', ->
        beforeEach ->
          @shader.code 'top', "void helper(int i) { }"

        it 'should make the method argument available for reference', ->
          expect(@shader.helper.i).toBeDefined()

        describe 'connections', ->
          beforeEach ->
            @shader.helper i: @shader.uniforms.x

          it 'should call the helper with the correct input', ->
            expect(@shader.toString()).toInclude 'helper(U_x);'

      describe 'with inout qualifier', ->
        beforeEach -> @shader.code 'top', "void helper(inout int i);"

        it 'should make the method argument available for reference', ->
          expect(@shader.helper.i).toBeDefined()

        describe 'connections', ->
          beforeEach ->
            @shader.helper i: @shader.uniforms.x

          it 'should generate a variable to store the output', ->
            # we can't trust input args to be writable (e.g. attributes)
            # so we must generate intermediary ones to handle output
            expect(@shader.toString()).toInclude 'int helper_i'

          it 'should call the helper with the correct input', ->
            expect(@shader.toString()).toInclude 'helper(helper_i'

      describe 'with out qualifier', ->
        beforeEach -> @shader.code 'top', "void helper(out int i);"

        it 'should make the method argument available for reference', ->
          expect(@shader.helper.i).toBeDefined()

        describe 'connection without mapping the output argument', ->
          beforeEach ->
            @shader.helper()

          it 'should generate a variable to store the output', ->
            # we can't trust input args to be writable (e.g. attributes)
            # so we must generate intermediary ones to handle output
            expect(@shader.toString()).toInclude 'int helper_i'

          it 'should call the helper with the output argument', ->
            expect(@shader.toString()).toInclude 'helper(helper_i'

  describe 'iteration', ->
    beforeEach ->
      @shader.addUniforms int: 'lightType[3]'
      @shader.iterate 'N', (iter) => @block = @iterator = iter

    itShouldBehaveLike 'a shader block'

    it 'should be able to dereference uniform arrays', ->
      @iterator.add "x", @shader.uniforms.lightType[@iterator]
      expect(@shader.toString()).toInclude "x += U_lightType[#{@iterator.name}]"

  it 'should have a main()', ->
    expect(@shader.toString()).toInclude 'void main()'

  it 'should have a varyings object', ->
    expect(@shader.varyings).not.toBeUndefined()

  it 'should have a uniforms object', ->
    expect(@shader.uniforms).not.toBeUndefined()

  it 'should define a default float precision', ->
    expect(@shader.toString()).toInclude 'precision mediump float;'

  it 'should define a default int precision', ->
    expect(@shader.toString()).toInclude 'precision mediump int;'

  itShouldBehaveLike 'a shader block'

describe 'Jax.Shader.DSL', ->
  beforeEach -> @shader = new Jax.Shader.DSL.TopLevel
  itShouldBehaveLike 'a shader'

  describe 'when a main() is added', ->
    beforeEach -> @shader.code 'top', 'void main(void) { return 1; }'

    it 'should not define 2 mains', ->
      expect(@shader.toString()).not.toMatch /main(.|\n)*main/

