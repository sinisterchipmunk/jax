class Jax.Dev.Views.Tools extends Backbone.View
  id: "tools"
  template: JST['jax/dev/tools']

  initialize: ->
    # the Jax context to be interrogated/manipulated
    @jax = @options.context
    @render()

  render: ->
    @$el.html @template()
