class Jax.Dev.Views.ControllerListItem extends Backbone.View
  template: JST['jax/dev/controller_list/item']
  tagName: "li"

  initialize: ->
    @render()

  render: =>
    @$el.html @template @model.toJSON()
