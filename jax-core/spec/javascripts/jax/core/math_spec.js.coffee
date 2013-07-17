describe 'Math', ->
  result = null

  describe '#equalish', ->
    describe 'given a number and a vector', ->
      beforeEach -> result = Math.equalish 1, [1]
      it 'should be false', -> expect(result).toBeFalse()

  describe '#sign', ->
    describe 'given a improper number', ->
      it 'should return 0 if it is NaN', ->
        expect(Math.sign(NaN)).toBe(0)
      it 'should return 0 if it is undefined', ->
        expect(Math.sign()).toBe(0)
      it 'should return 0 if it is a non numeric string', ->
        expect(Math.sign('zero!')).toBe(0)
    describe 'given a numeric string', ->
      it 'should return the sign', ->
        expect(Math.sign('0')).toBe(0)
        expect(Math.sign('42')).toBe(1)
        expect(Math.sign('-13')).toBe(-1)
        expect(Math.sign('10e10')).toBe(1)
        expect(Math.sign('10e-10')).toBe(1)
    describe 'given a proper number', ->
      it 'should return 1 if it is more than 0', ->
        expect(Math.sign(42)).toBe(1)
        expect(Math.sign(1)).toBe(1)
        expect(Math.sign(0.666)).toBe(1)
        expect(Math.sign(0.0000001)).toBe(1)
        expect(Math.sign(10e10)).toBe(1)
        expect(Math.sign(10e-10)).toBe(1)
      it 'should return 1 if it is Infinity', ->
        expect(Math.sign(Infinity)).toBe(1)
      it 'should return -1 if it is less than 0', ->
        expect(Math.sign(-69)).toBe(-1)
        expect(Math.sign(-1)).toBe(-1)
        expect(Math.sign(-0.999)).toBe(-1)
        expect(Math.sign(-0.0000001)).toBe(-1)
      it 'should return -1 if it is -Infinity', ->
        expect(Math.sign(-Infinity)).toBe(-1)
      it 'should return 0 if it is 0', ->
        expect(Math.sign(0)).toBe(0)
