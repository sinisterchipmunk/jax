class Jax.Dev.Views.ProgressBar extends Backbone.View
  template: JST['jax/dev/progress_bar']
  tagName: "div"
  className: "progress-bar"

  initialize: ->
    @max = @options.max
    @label = @options.label
    @render()

  render: =>
    @$el.html @template @options
    @bars = {}
    @find('default').el.css('background-color', @options.background)

  increment: (color = 'default') => @set @get(color) + 1, color

  color: (color) =>
    @find(color).el.css 'background-color', color

  find: (color) =>
    return @bars[color] if @bars[color]
    @bars[color] =
      el: $("<div class='bar' id='#{color}'></div>")
      val: 0
    @bars[color].el.css 'background-color', color
    @bars[color]

  reset: =>
    bar.val = 0 for color, bar of @bars
    for color, bar of @bars
      bar.el.removeClass 'complete'
    @refresh()

  get: (color = 'default') => @find(color).val

  set: (x, color = 'default') =>
    current = @current()
    if current + x - @get(color) >= @max
      x = @max - current + @get(color)
      current = @max
    @find(color).val = x
    @refresh()
    @ready() if current is @max

  current: =>
    n = 0
    n += bar.val for color, bar of @bars
    n

  ready: =>
    @options.ready?()
    @trigger 'ready'
    for color, bar of @bars
      bar.el.addClass 'complete'

  refresh: =>
    @$("#title").text(@label).append "&hellip;"
    ofs = @$("#title").offset()
    incr_width = @$("#title").outerWidth() / @max
    for color, bar of @bars
      if bar.val > 0
        w = parseInt incr_width * bar.val
        unless @$(".bar-container ##{color.replace(/^\#/, '')}").length
          @$(".bar-container").append bar.el
        bar.el.offset ofs
        bar.el.width w
        bar.el.text ' '
        ofs.left += w
      else
        bar.el.remove()
