describe "Jax.Dev.Models.SpecSuite", ->
  class MockJasmineEnv
    constructor: ->
      @reporters = []
    execute: ->
      r.reportRunnerStarting(specs: -> [1,2]) for r in @reporters
    addReporter: (r) -> @reporters.push r

  env = null
  beforeEach ->
    env = new MockJasmineEnv
    spyOn($, 'ajax').andCallFake (o) => @ajax = o
    @model = new Jax.Dev.Models.SpecSuite
    @model.inject jasmine: { getEnv: => env }

  it 'should produce an ajax request for specs', ->
    expect(@ajax?.url).toEqual Jax.Dev.Paths['spec_index']

  describe 'after ajax returns', ->
    beforeEach ->
      @index = ['/path/to/spec/1', '/path/to/spec/2']
      @ajax?.success? @index

    it 'should set its index', ->
      expect(@model.get 'index').toEqual @index

    describe "after the scripts have loaded", ->
      beforeEach ->
        # we do this explicitly because the above scripts never loaded:
        # they generated 404's instead.
        @model.ready()

      describe 'starting the suite', ->
        beforeEach ->
          # stub jasmine
          spyOn(env, 'execute').andCallThrough()
          @model.start()

        it 'should execute the specs', ->
          expect(env.execute).toHaveBeenCalled()

        it 'should know how many specs are running', ->
          expect(@model.get 'totalSpecsDefined').toEqual 2
