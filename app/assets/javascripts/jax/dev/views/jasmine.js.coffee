class Jax.Dev.Views.Jasmine extends Backbone.View
  template: JST['jax/dev/jasmine']

  tagName: "div"
  className: "jasmine"

  events:
    "click a.start"       : "start"
    "click a.rerun"       : "rerun"
    "click a.stop"        : "stop"
    "click a.show-results": "showResultsDialog"

  stop: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    @suite?.stop()

  showResultsDialog: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    return @suite.start() unless @suite.isLoading() || @suite.isRunning() || @suite.hasFailures()
    @resultsDialog.show()

  rerun: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    @suite.rerun()

  start: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    return if @suite.isRunning()
    unless @statusView
      @statusView = new Jax.Dev.Views.Jasmine.Status model: @suite
      @$(".status").replaceWith @statusView.$el
      @resultsDialog = new Jax.Dev.Views.Jasmine.ResultsDialog model: @suite
    @suite.start()

  # update ui to reflect that the suite has stopped its run
  reflectSuiteStopped: =>
    @$(".rerun").show()
    @$(".stop").hide()
    current = @$('.start').width()
    target = @$(".start").css("width", "auto").width()
    @$(".start").width current
    @$(".start").animate {
      width: target
    }, 'fast', => @$(".start").css('width', 'auto')
    # @$(".start").show()

  # update ui to reflect that the suite has started its run
  reflectSuiteStarted: =>
    @$(".rerun").hide()
    @$(".stop").show()
    @$(".start").animate {
      width: 0
    }, 'fast'
    # @$(".start").hide()

  initialize: ->
    @suite = new Jax.Dev.Models.SpecSuite
    # can also emit 'aborted' if killed before it completes at all
    @suite.on 'completedWithSuccess', =>
      @reflectSuiteStopped()
      @statusView.collapse()
    @suite.on 'completedWithFailure', =>
      @reflectSuiteStopped()
    @suite.on 'aborted', =>
      @reflectSuiteStopped()
    @suite.on 'starting', =>
      @reflectSuiteStarted()
      @statusView.expand()
    @render()

  render: ->
    @$el.html @template()
