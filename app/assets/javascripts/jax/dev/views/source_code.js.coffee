class Jax.Dev.Views.SourceCode extends Backbone.View
  template: JST['jax/dev/source_code']

  className: "source-code"

  initialize: ->
    $.ajax
      url: @options.url
      dataType: 'text'
      success: @render

  render: (code) =>
    @$el.html @template code: code
    @$el.attr 'title', @options.url
    SyntaxHighlighter.highlight {
      highlight: [@options.line]
      brush: "js"
      toolbar: false
    }, @$(".js")[0]
    dialog = @$el.dialog
      width: $(window).width() * 0.6
      height: $(window).height() * 0.9
      close: =>
        dialog.dialog 'destroy'
        dialog.remove()
        @$el.remove()
    @$el.addClass @cid
    # scroll to 10 lines before the target
    line = @options.line - 10
    top = $(".#{@cid}").find(".line.number#{line}").offset().top
    $(".#{@cid}").scrollTop top unless top is undefined
