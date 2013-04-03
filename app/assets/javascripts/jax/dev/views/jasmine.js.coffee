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

  initialize: ->
    @suite = new Jax.Dev.Models.SpecSuite
    # can also emit 'aborted' if killed before it completes at all
    @suite.on 'completedWithSuccess', =>
      @$(".rerun").show()
      @$(".stop").hide()
      @$(".start").show()
      @statusView.collapse()
    @suite.on 'completedWithFailure', =>
      @$(".rerun").show()
      @$(".stop").hide()
      @$(".start").show()
    @suite.on 'aborted', =>
      @$(".rerun").show()
      @$(".stop").hide()
      @$(".start").show()
    @suite.on 'starting', =>
      @$(".rerun").hide()
      @$(".stop").show()
      @$(".start").hide()
      @statusView.expand()
    @render()

  render: ->
    @$el.html @template()
