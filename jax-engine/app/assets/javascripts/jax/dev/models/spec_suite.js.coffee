class Jax.Dev.Models.SpecSuite extends Backbone.Model
  newIFrame = ->
    iframe = $ '<iframe style="display:none;"></iframe>'
    $('body').append iframe # this is necessary
    iframe
  
  cacheBuster = -> Math.random()

  finishedLoading: (which) =>
    @trigger 'sourceLoaded', which

  ready: =>
    @set 'loading', false
    env = @get('_global').jasmine.getEnv()
    env.specFilter = (spec) => !@_passing[spec.getFullName()]
    @get("_global").onload?()
    reporter = new Jax.Dev.Models.SpecReporter this
    env.addReporter reporter
    env.execute()
    @trigger 'executingSuite'
    @set 'env', env
    @trigger 'ready'

  # injects the set of objects into the spec suite's global context.
  inject: (objects) ->
    _.extend @get("_global"), objects

  start: =>
    @set 'running', true
    @loadIndex()

  isRunning: =>
    @get 'running'

  hasFailures: =>
    @get 'specsFailed'

  isLoading: =>
    @get 'loading'

  stop: =>
    @set 'running', false
    @_indexReq?.abort()
    @get('_iframe').remove()
    @set '_iframe', newIFrame()

  # Rebuilds the spec index, and then re-runs specs which failed on the last
  # execution, as well as any brand-new specs. Does not run specs which 
  # have passed during the lifetime of this model.
  rerun: =>
    @stop()
    @set @defaults()
    @trigger 'rerun'
    @start()

  reload: =>
    sources = @get 'index'
    return unless sources.length
    @trigger 'fetchingSources'
    head = @get('_iframe').contents().find 'head'
    fn = =>
      if sources.length
        filename = sources.shift()
        script = document.createElement('script')
        filename = filename.replace(/\?body=1/, '')
        script.onload = =>
          @finishedLoading filename
          setTimeout fn, 1
        script.type = 'text/javascript'
        script.src = filename + "?body=1&__cachebuster=" + cacheBuster()
        head[0].appendChild script
      else
        @ready()
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
    running: false
    loading: false

  addResult: (result) ->
    @get('results').push result
    @trigger 'result', result

  loadIndex: =>
    @set 'loading', true
    @trigger 'fetchingIndex'
    @_indexReq = $.ajax
      type: "GET"
      url: Jax.Dev.Paths['spec_index']
      dataType: 'json'
      success: (data) =>
        @set 'index', data

  initialize: ->
    @on 'change:_iframe', =>
      @set '_global', @get('_iframe').get(0).contentWindow
    @on 'change:index', @reload
    @on 'change:running', =>
      if @isRunning()
        @trigger 'starting'
      else
        if @get('specsCompleted') is @get('totalSpecsDefined')
          if @get('specsFailed') is 0
            @trigger 'completedWithSuccess'
          else
            @trigger 'completedWithFailure'
        else
          @trigger 'aborted'
    @_passing = []
