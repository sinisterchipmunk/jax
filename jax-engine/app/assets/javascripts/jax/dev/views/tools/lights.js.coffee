class Jax.Dev.Views.Tools.Lights extends Backbone.View
  template: JST['jax/dev/tools/light']

  initialize: ->
    @jax = @options.context
    @jax.world.on 'lightAdded', @add
    @jax.world.on 'lightRemoved', @remove
    @render()

  add: (light) =>
    if light instanceof Jax.Light.Spot
      view = new Jax.Dev.Views.Tools.Lights.Spot
        model: light
    else
      view = new Jax.Dev.Views.Tools.Lights.Item
        model: light
    view.on 'layout', => @trigger 'layout'
    @$el.append view.$el

  remove: (light) =>
    @$("*[data-id=#{light.__unique_id}]").remove()

  render: =>
    @$el.empty()
    for light in @jax.world.lights
      @add light
    true
