class Jax.Dev.Views.Workspace extends Backbone.View
  initialize: -> @render()

  setView: (view) ->
    @$("#content").html view.$el

  render: =>
    @$el.empty()
    @$el.append $ "<div id='content' />"
