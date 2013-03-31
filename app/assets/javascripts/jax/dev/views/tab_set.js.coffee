class Jax.Dev.Views.TabSet extends Backbone.View
  className: "tabset"

  template: JST['jax/dev/tab_set']

  events:
    "click .tab": 'tabClicked'

  cancel: =>
    for label, view of @options.tabs
      view.cancel?()
    true

  tabClicked: (e) =>
    e?.preventDefault()
    label = $(e.currentTarget).attr("data-caption")
    @activate label
    @options.tabs[label].trigger 'tab-selected'

  initialize: ->
    for label, view of @options.tabs
      @default or= label
      view.on 'layout', => @trigger 'layout'
    @render()

  activate: (label) =>
    filter = -> $(this).attr('data-caption') == label
    @$(".active").removeClass "active"
    @$(".tab").filter(filter).addClass "active"
    @$(".tab-content").hide()
    @$(".tab-content").filter(filter).show()

  render: ->
    @$el.html @template labels: @options.tabs
    for content in @$(".tab-content")
      content = $ content
      content.html @options.tabs[content.attr('data-caption')].$el
    @activate @default