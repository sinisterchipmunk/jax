describe "Jax.Dev.Models.SpecSuite", ->
  class MockJasmineEnv
    # returns a mock failing spec
    fail: ->
      shortDescription: "fails"
      getFullName: -> "a failing spec #{@shortDescription}"
      results: ->
        skipped: false
        passed: -> false
        getItems: -> []

    # returns a mock passing spec
    pass: ->
      shortDescription: "should pass"
      getFullName: -> "a passing spec #{@shortDescription}"
      results: ->
        skipped: false
        passed: -> true
        getItems: -> []

    complete: ->
      # report results: first one passed, second one failed
      @reporter.reportSpecResults @pass()
      @reporter.reportSpecResults @fail()
    execute: ->
      @reporter.reportRunnerStarting(specs: -> [1,2])
    addReporter: (r) -> @reporter = r

  env = null
  beforeEach ->
    env = new MockJasmineEnv
    spyOn($, 'ajax').andCallFake (o) => @ajax = o; abort: ->
    realDefaults = Jax.Dev.Models.SpecSuite.prototype.defaults
    spyOn(Jax.Dev.Models.SpecSuite.prototype, 'defaults').andCallFake ->
      defs = realDefaults()
      defs._global.jasmine = getEnv: -> env
      defs
    @model = new Jax.Dev.Models.SpecSuite

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

        describe 'when the suite finishes', ->
          beforeEach -> env.complete()

          it 'should log a pass and a fail', ->
            expect(@model.get 'specsPassed').toEqual 1
            expect(@model.get 'specsFailed').toEqual 1

          describe "rerunning", ->
            beforeEach ->
              @ajax = null
              spyOn(@model, 'stop').andCallThrough()
              @model.rerun()

            it 'should generate a new ajax request', ->
              expect(@ajax).not.toBe null

            it 'should stop the suite', ->
              expect(@model.stop).toHaveBeenCalled()

            describe "when ready again", ->
              beforeEach ->
                spyOn(@model, 'start').andCallThrough()
                @index = ['/path/to/spec/1', '/path/to/spec/2']
                @ajax?.success? @index
                @model.ready()
                @model.start()

              it 'should set a spec filter to prevent running passing specs', ->
                expect(env.specFilter).not.toBe undefined
