class Jax.Dev.Views.ControllerList extends Backbone.View
  tagName: "ul"

  id: 'controller-list'

  initialize: -> @render()

  add: (model) =>
    view = new Jax.Dev.Views.ControllerListItem
      model: model
    @$el.append view.$el

  render: =>
    @$el.empty()
    @collection.each @add
    @$el.draggable
      distance: 20
    true
