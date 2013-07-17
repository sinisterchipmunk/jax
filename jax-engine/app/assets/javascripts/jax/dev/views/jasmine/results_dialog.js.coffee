class Jax.Dev.Views.Jasmine.ResultsDialog extends Backbone.View
  urlrx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(?:\:[0-9]*)?((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w\:]*))?)/g

  template: JST['jax/dev/jasmine/results_dialog/item']
  tagName: "ul"
  className: "spec-results"

  showSource: (e) =>
    e?.preventDefault()
    e?.stopPropagation()
    link = $(e.target)
    new Jax.Dev.Views.SourceCode
      url: link.attr('data-url')
      line: link.attr('data-line')

  show: =>
    return if @_dialog
    @popped = true
    @_dialog = @$el.dialog
      width: $(window).width() * 0.7
      height: $(window).height() * 0.7
      close: @hide
      title: "#{@failureCount} FAILURES"
    true

  hide: =>
    @_dialog?.dialog 'destroy'
    @_dialog = null

  initialize: ->
    @popped = false
    @model.on 'rerun', =>
      @popped = false
      @clearFailures()
    @render()

  clearFailures: =>
    @_selectionName = ""
    @setFailureCount 0
    @$el.html $ '<div class="log no-failures">No failures reported.</div>'

  setFailureCount: (n) =>
    @failureCount = n
    title = "#{@failureCount} FAILURES"
    if @_selectionName isnt ""
      title += " : #{@_selectionName}"
    @_dialog?.dialog 'option', 'title', title

  selection: (desc) =>
    @_selectionName = desc
    @setFailureCount @failureCount

  bumpFailureCount: =>
    @setFailureCount @failureCount + 1

  render: =>
    @clearFailures()
    @model.on 'result', (result) =>
      if result.status is 'failed'
        @bumpFailureCount()
        @$(".log.no-failures").remove()
        result.entries = for entry in result.entries
          type: entry.type
          message: entry.message
          expect: entry.type is 'expect' and entry.passed and !entry.passed()
          stack: @preprocessStack entry.stack || ""
        item = $ @template result
        item.on 'mouseover', => @selection result.longDescription
        item.find('a.view-source').click @showSource
        @$el.append item
        @show() unless @popped

  preprocessStack: (stack) =>
    # escape, but then undo some of the less-breaking escapes so we can get 
    # at the url's
    _.escape(stack).replace(/\&\#x2F;/g, '/').replace(/\&amp;/g, '&').replace urlrx, (a, b) ->
      match = /(.*?)\:([0-9]+)\:([0-9]+)$/.exec(a)
      [url, line, col] = [match[1], match[2], match[3]]
      "<a target='_blank' href='view-source:#{url}##{line}' data-line='#{line}' data-url='#{url}' data-col='#{col}' class='view-source'>#{a}</a>"
