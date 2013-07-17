globalSharedExampleGroups = {}

window.sharedExamplesFor = (name, fn) ->
  if jasmine.getEnv().currentSuite
    jasmine.getEnv().currentSuite.sharedExamplesFor name, fn
  else
    globalSharedExampleGroups[name] = fn

window.itShouldBehaveLike = (name) ->
  jasmine.getEnv().currentSuite.itShouldBehaveLike name

jasmine.Suite.prototype.sharedExamplesFor = (name, fn) ->
  @sharedExampleGroups or= {}
  @sharedExampleGroups[name] = fn

jasmine.Suite.prototype.itShouldBehaveLike = (name) ->
  if @sharedExampleGroups && @sharedExampleGroups[name]
    describe "should behave like #{name}:", @sharedExampleGroups[name]
  else if @parentSuite
    @parentSuite.itShouldBehaveLike name
  else if globalSharedExampleGroups[name]
    describe "should behave like #{name}:", globalSharedExampleGroups[name]
  else
    throw new Error "Shared example group '#{name}' could not be found"
