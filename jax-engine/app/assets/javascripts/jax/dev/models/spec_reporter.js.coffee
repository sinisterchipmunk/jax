class Jax.Dev.Models.SpecReporter
  constructor: (@model) ->
    @counter = 0

  reportRunnerStarting: (runner) ->
    @model.set 'totalSpecsDefined', (runner.specs() || []).length
    @model.set 'running', true

  reportRunnerResults: (runner) ->
    @model.set 'running', false

  reportSuiteResults: (suite) ->
    
  reportSpecStarting: (spec) ->

  bustrx = /[\&\?]__cachebuster=[0-9]+\.[0-9]+/g
  reportSpecResults: (spec) ->
    result = spec.results()
    status = if result.passed() then 'passed' else 'failed'
    status = 'skipped' if result.skipped
    # null out the cachebuster that we added while loading scripts
    entries = for entry in result.getItems()
      if stack = entry.trace.stack
        entry.stack = stack.replace(bustrx, '')
      entry
    @model.addResult result =
      shortDescription: spec.description
      longDescription: spec.getFullName()
      entries: entries
      status: status

    switch status
      when 'skipped' then @model.incr 'specsSkipped', 1
      when 'failed'  then @model.incr 'specsFailed',  1
      when 'passed'
        @model.incr 'specsPassed',  1
        @model._passing[spec.getFullName()] = true
    @model.incr 'specsCompleted', 1

