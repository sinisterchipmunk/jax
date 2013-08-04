#= require jax/mixins/attributes

describe 'Jax.Mixins.Attributes', ->
  beforeEach ->
    class Mock
      @include Jax.Mixins.Attributes
      constructor: -> @initializeAttributes()
    @mock = new Mock()

  it 'should return undefined for an unassigned attribute', ->
    expect(@mock.get 'wtf').toBeUndefined()

  it 'should return undefined for an unassigned previous attribute', ->
    expect(@mock.getPrevious 'wtf').toBeUndefined()

  describe 'attribute assignment with a listener', ->
    beforeEach ->
      @mock.trigger = (args...) => @triggeredArgs = args
      @mock.set 'wtf', 1

    it 'should trigger change:wtf with itself as the event object', ->
      expect(@triggeredArgs).toEqual ['change:wtf', @mock]

  describe 'attribute assignment', ->
    beforeEach -> @result = @mock.set "wtf", 1
    
    it 'should return the new value from #get', ->
      expect(@mock.get 'wtf').toEqual 1

    it 'should return the new value from #set', ->
      expect(@result).toEqual 1

    it 'should return `undefined` for the previous value, since there is none', ->
      expect(@mock.getPrevious 'wtf').toBeUndefined()

    describe 'twice', ->
      beforeEach -> @result = @mock.set 'wtf', 2

      it 'should replace the current value', ->
        expect(@mock.get 'wtf').toEqual 2

      it 'should assign the old value to previous', ->
        expect(@mock.getPrevious 'wtf').toEqual 1

