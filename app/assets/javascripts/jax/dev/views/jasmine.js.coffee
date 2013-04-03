class Jax.Dev.Views.Jasmine extends Backbone.View
  template: JST['jax/dev/jasmine']

  tagName: "div"
  className: "jasmine"

  events:
    "click a.start"       : "start"
    "click a.stop"        : "stop"
    "click a.show-results": "showResultsDialog"

  showSource: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    link = $(e.target)
    new Jax.Dev.Views.SourceCode
      url: link.attr('data-url')
      line: link.attr('data-line')

  stop: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    @_running = false
    @suite?.stop()
    @$("a.stop").hide()
    @$(".status").animate {
      width: @$(".led").width()
    }, 'fast'

  showResultsDialog: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    return false if @_dialog
    return @start() || false unless @$(".status").hasClass("failing")
    # FIXME @_log should be a separate View
    @_dialog = @_log.dialog
      width: $(window).width() * 0.7
      height: $(window).height() * 0.7
      close: =>
        @_dialog.dialog 'destroy'
        @_dialog = null
    true

  start: (e) =>
    urlrx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(?:\:[0-9]*)?((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w\:]*))?)/g
    e?.preventDefault()
    e?.stopPropagation()
    return if @_running
    @_running = true
    if @_log
      @_log.empty()
    else
      @_log = $ '<ul class="spec-results" title="FAILURES"></ul>'
    progress = new Jax.Dev.Views.ProgressBar
      label: 'Fetching Spec Index'
      max: 1
      # ready: -> console.log 'ready', progress
    $status = @$(".status")
    $status.removeClass('passing failing').addClass('loading')
    $status.find(".progress-bar").remove()
    $status.append progress.$el
    prev = $status.width()
    $status.css 'width', 'auto'
    w = $status.width()
    $status.css 'width', prev
    $status.animate {
      width: w
    }, 'fast', -> $status.css 'width', 'auto'
    @$(".stop").show()
    resultsShown = false
    @suite = new Jax.Dev.Models.SpecSuite
    @suite.on 'result', (result) =>
      if result.status is 'failed'
        el = $ '<li class="failure"></li>'
        el.text result.longDescription
        el.on 'mouseover', =>
          @_dialog.dialog 'option', 'title', "FAILURE: #{result.longDescription}"
        for entry in result.entries
          div = $ '<div></div>'
          el.append div
          if entry.type is 'log'
            div.addClass 'log'
            div.text entry.toString()
          else if entry.type is 'expect' and entry.passed and !entry.passed()
            div.addClass 'expectation'
            div.text entry.message
            if entry.stack
              stack = $ '<div class="stack"></div>'
              text = entry.stack.replace urlrx, (a, b) ->
                match = /(.*?)\:([0-9]+)\:([0-9]+)$/.exec(a)
                [url, line, col] = [match[1], match[2], match[3]]
                "<a target='_blank' href='view-source:#{url}##{line}' data-line='#{line}' data-url='#{url}' data-col='#{col}' class='view-source'>#{a}</a>"
              stack.html text
              stack.find('a.view-source').click @showSource
              el.append stack
        @_log.append el
        # track resultsShown locally so that if user closes dialog, we don't 
        # try to re-open it
        resultsShown = @showResultsDialog() unless resultsShown
    @suite.on 'change:index', =>
      progress.increment()
      progress.max = @suite.get('index').length
      progress.label = 'Fetching Latest Sources'
      progress.refresh()
    @suite.on 'sourceLoaded', => progress.increment()
    @suite.on 'ready', =>
      @suite.on 'change:totalSpecsDefined', =>
        $status.addClass 'passing'
        progress.max = @suite.get 'totalSpecsDefined'
        progress.label = "Running #{progress.max} Specs"
        progress.reset()
        progress.on 'ready', =>
          @$(".stop").hide()
          @_running = false
      @suite.on 'change:specsCompleted', =>
        total = @suite.get 'totalSpecsDefined'
        completed = @suite.get 'specsCompleted'
        progress.label = "Completed #{completed} of #{total} Specs"
        progress.refresh()
      @suite.on 'change:specsPassed', (suite, v) => progress.set v, '#0f0'
      @suite.on 'change:specsSkipped',(suite, v) => progress.set v, '#fff'
      @suite.on 'change:specsFailed', (suite, v) =>
        $status.removeClass 'passing'
        $status.addClass 'failing'
        progress.set v, '#f00'
      @suite.start()


  initialize: ->
    @render()
    # @jasmine = jasmine.getEnv()
    # jasmine.updateInterval = 1000
    # htmlReporter = new jasmine.HtmlReporter()
    # jasmine.addReporter htmlReporter
    # jasmine.specFilter = (spec) -> htmlReporter.specFilter spec
    # $ -> jasmine.execute()

  render: ->
    @$el.html @template()
    # @$el.attr 'title', 'Jasmine Specs'
    # @$el.html @template()
    # @$el = @$el.dialog
    #   close: => @$el.remove()
