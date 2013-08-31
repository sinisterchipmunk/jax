describe 'Jax.Mixins.EventEmitter', ->
  beforeEach ->
    class Emitter
      @include Jax.Mixins.EventEmitter
    @emitter = new Emitter
    @listenerID = @emitter.on 'evt', (obj) => @evt = obj

  # don't taint other tests
  afterEach -> @evt = undefined

  sharedExamplesFor 'listening to multiple events', ->
    it 'should catch the first', ->
      @emitter.trigger 'one'
      expect(@fired).toBeTrue()

    it 'should catch the second', ->
      @emitter.trigger 'two'
      expect(@fired).toBeTrue()

  sharedExamplesFor 'not listening to any events', ->
    it 'should not catch the first', ->
      @emitter.trigger 'one'
      expect(@fired).not.toBeTrue()

    it 'should not catch the second', ->
      @emitter.trigger 'two'
      expect(@fired).not.toBeTrue()

  describe 'listening for more than one type of event (single space)', ->
    beforeEach -> @emitter.on 'one two', => @fired = true
    itShouldBehaveLike 'listening to multiple events'

    describe 'off', ->
      beforeEach -> @emitter.off 'one two'
      itShouldBehaveLike 'not listening to any events'
  
  describe 'listening for more than one type of event (multi space)', ->
    beforeEach -> @emitter.on 'one  \t\n two', => @fired = true
    itShouldBehaveLike 'listening to multiple events'

    describe 'off', ->
      beforeEach -> @emitter.off 'one \t\n  two'
      itShouldBehaveLike 'not listening to any events'
  
  describe 'listening for more than one type of event (comma)', ->
    beforeEach -> @emitter.on 'one,two', => @fired = true
    itShouldBehaveLike 'listening to multiple events'

    describe 'off', ->
      beforeEach -> @emitter.off 'one,two'
      itShouldBehaveLike 'not listening to any events'
  
  describe 'listening for more than one type of event (comma space)', ->
    beforeEach -> @emitter.on 'one, two', => @fired = true
    itShouldBehaveLike 'listening to multiple events'

    describe 'off', ->
      beforeEach -> @emitter.off 'one, two'
      itShouldBehaveLike 'not listening to any events'
  
  it "should pass events to listeners", ->
    @emitter.trigger 'evt', 1
    expect(@evt).toBeTruthy()

  it "should work with no event at all", ->
    @evt = 1
    @emitter.trigger 'evt'
    expect(@evt).toBeUndefined()

  it "should trigger higher scopes on scoped events", ->
    @emitter.trigger 'evt:two', 1
    expect(@evt).toEqual 1
  
  it "should be un-listenenable", ->
    # because the original listener never was fired
    @emitter.off 'evt', @listenerID
    @emitter.trigger 'evt', {}
    expect(@evt).toBeUndefined()

  describe "off() with no args", ->
    beforeEach -> @emitter.off()

    it "should remove the listener", ->
      @emitter.trigger 'evt', {}
      expect(@evt).toBeUndefined()
