class Jax.Dev.Views.Jasmine.Status extends Backbone.View
  template: JST['jax/dev/jasmine/status']

  className: "status"

  fetchingIndex: =>
    @$el.removeClass 'passing failing'
    @$el.addClass 'loading'
    @progress.reset()
    @progress.max = 1
    @progress.label = 'Fetching Spec Index'
    @progress.refresh()

  fetchingSources: =>
    @progress.increment()
    @progress.max = @model.get('index').length
    @progress.label = 'Fetching Latest Sources'
    @progress.refresh()

  sourceLoaded: =>
    @progress.increment()

  executingSuite: =>
    @$el.removeClass 'loading'
    @$el.addClass 'passing'
    @progress.max = @model.get 'totalSpecsDefined'
    @progress.label = "Running #{@progress.max} Specs"
    @progress.reset()
    @progress.once 'ready', =>
      @$(".rerun").show()
      @$(".stop").hide()

  specCompleted: =>
    total = @model.get 'totalSpecsDefined'
    completed = @model.get 'specsCompleted'
    @progress.label = "Completed #{completed} of #{total} Specs"
    @progress.refresh()

  specPassed: (suite, v) =>
    @progress.set v, '#0f0'

  specSkipped: (suite, v) =>
    @progress.set v, '#fff'

  specFailed: (suite, v) =>
    @$el.removeClass 'passing'
    @$el.addClass 'failing'
    @progress.set v, '#f00'

  initialize: ->
    @progress = new Jax.Dev.Views.ProgressBar
      label: 'Fetching Spec Index'
      max: 1
    @model.on 'fetchingIndex',         @fetchingIndex
    @model.on 'fetchingSources',       @fetchingSources
    @model.on 'sourceLoaded',          @sourceLoaded
    @model.on 'executingSuite',        @executingSuite
    @model.on 'change:specsCompleted', @specCompleted
    @model.on 'change:specsPassed',    @specPassed
    @model.on 'change:specsSkipped',   @specSkipped
    @model.on 'change:specsFailed',    @specFailed
    @render()

  collapse: =>
    @$el.animate {
      width: @$(".led").width()
    }, 'fast'
    this

  expand: =>
    @$el.removeClass('passing failing').addClass('loading')
    prev = @$el.width()
    @$el.css 'width', 'auto'
    w = @$el.width()
    @$el.css 'width', prev
    @$el.animate {
      width: w
    }, 'fast', => @$el.css 'width', 'auto'
    @$(".stop").show()
    this

  render: =>
    @$el.html @template()
    @$el.append @progress.$el
