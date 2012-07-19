describe 'Math', ->
  result = null

  describe '#equalish', ->
    describe 'given a number and a vector', ->
      beforeEach -> result = Math.equalish 1, [1]
      it 'should be false', -> expect(result).toBeFalse()
