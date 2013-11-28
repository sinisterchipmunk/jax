describe 'Jax.Shader.DSL.GlobalDefinitions', ->
  beforeEach -> @global = new Jax.Shader.DSL.GlobalDefinitions

  describe 'after a definition has been added', ->
    beforeEach -> @global.add 'vec3', 'position', 'A_'

    it 'should be a property of the global', ->
      expect(@global.position).toBeDefined()

  describe 'with an array variable definition', ->
    beforeEach -> @global.add 'vec3', 'lightPosition[4]', 'U_'

    it 'should not include its capacity in string form', ->
      expect(@global.lightPosition.toString()).toEqual "U_lightPosition"

    describe 'adding an index on the variable', ->
      beforeEach -> @global.addIndex 'iter'

      describe 'dereferencing with the index name', ->
        beforeEach -> @deref = @global.lightPosition['iter']

        it 'should return the full indexed name', ->
          expect(@deref).toEqual 'U_lightPosition[iter]'

      describe 'dereferencing with a number', ->
        beforeEach -> @deref = @global.lightPosition[3]

        it 'should return the indexed name', ->
          expect(@deref).toEqual 'U_lightPosition[3]'

      describe 'dereferencing with a number in string form', ->
        beforeEach -> @deref = @global.lightPosition['3']

        it 'should return the indexed name', ->
          expect(@deref).toEqual 'U_lightPosition[3]'

      describe 'dereferencing with a different index name', ->
        beforeEach -> 

        it 'should raise an error', ->
          expect(-> @deref = @global.lightPosition['missing']).toThrow()
