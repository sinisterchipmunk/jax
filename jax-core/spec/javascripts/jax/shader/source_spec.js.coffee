describe 'Jax.Shader.Source', ->
  beforeEach -> @source = new Jax.Shader.Source

  describe 'appending a string', ->
    beforeEach ->
      @source.on 'change', => @changed = true
      @source.append 'string'

    it 'should fire the change event', ->
      expect(@changed).toBe true

    it 'should produce a string', ->
      expect(@source.toString()).toEqual 'string'

    describe 'removing it', ->
      beforeEach ->
        @changed = false
        @source.remove 0

      it 'should be changed', ->
        expect(@changed).toBe true

      it 'should remove it', ->
        expect(@source.toString()).toEqual ''

  describe 'appending a function', ->
    beforeEach -> @source.append (obj) => obj.x

    it 'should call the function with the info provided', ->
      expect(@source.toString x: 1).toEqual '1'

    describe 'appending another function', ->
      beforeEach -> @source.append (obj) => obj.x * 2

      it 'should concatenate the two values', ->
        expect(@source.toString x: 1).toMatch /1[\s\t\n]*2/

    describe 'inserting at 0', ->
      beforeEach -> @source.insert 0, "x", "y"

      it 'should place the new string at the beginning', ->
        expect(@source.toString x: 1).toMatch /x[\s\t\n]*y[\s\t\n]*1/
