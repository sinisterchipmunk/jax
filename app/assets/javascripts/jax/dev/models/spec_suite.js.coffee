class SpecReporter
  constructor: (@model) ->
    @counter = 0

  reportRunnerStarting: (runner) ->
    @model.set 'totalSpecsDefined', (runner.specs() || []).length

  reportRunnerResults: (runner) ->

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
      when 'passed'  then @model.incr 'specsPassed',  1
      when 'failed'  then @model.incr 'specsFailed',  1
    @model.incr 'specsCompleted', 1

class Jax.Dev.Models.SpecSuite extends Backbone.Model
  newIFrame = ->
    iframe = $ '<iframe style="display:none;"></iframe>'
    $('body').append iframe # this is necessary
    iframe
  
  cacheBuster = -> Math.random()

  finishedLoading: (which) => @trigger 'sourceLoaded', which

  ready: =>
    @set 'env', @get('_global').jasmine.getEnv()
    @trigger 'ready'

  # injects the set of objects into the spec suite's global context.
  inject: (objects) ->
    _.extend @get("_global"), objects

  start: =>
    env = @get 'env'
    @get("_global").onload?()
    reporter = new SpecReporter this
    env.addReporter reporter
    env.execute()

  stop: =>
    @get('_iframe').remove()

  reload: =>
    sources = @get 'index'
    head = @get('_iframe').contents().find 'head'
    triggerLoad = @finishedLoading
    done = @ready
    fn = ->
      if sources.length
        filename = sources.shift()
        script = document.createElement('script')
        script.onload = ->
          triggerLoad filename
          setTimeout fn, 1
        script.type = 'text/javascript'
        script.src = filename + "?body=1&__cachebuster=" + cacheBuster()
        head[0].appendChild script
      else
        done()
    fn()

  incr: (key, amt) ->
    @set key, @get(key) + amt

  defaults: ->
    iframe = newIFrame()
    _iframe: iframe
    _global: iframe.get(0).contentWindow
    totalSpecsDefined: 0
    specsCompleted: 0
    specsPassed: 0
    specsSkipped: 0
    specsFailed: 0
    results: []
    index: []

  addResult: (result) ->
    @get('results').push result
    @trigger 'result', result

  initialize: ->
    $.ajax
      type: "GET"
      url: Jax.Dev.Paths['spec_index']
      dataType: 'json'
      success: (data) => @set 'index', data
    @on 'change:index', @reload
