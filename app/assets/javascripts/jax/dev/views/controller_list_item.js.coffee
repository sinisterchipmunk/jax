class Jax.Dev.Views.ControllerListItem extends Backbone.View
  template: JST['jax/dev/controller_list/item']
  tagName: "li"

  initialize: ->
    @render()

  render: =>
    @$el.html @template @model.toJSON()
    if document.location.hash.toString().indexOf("controllers/#{@model.get 'name'}") isnt -1
      @$el.addClass 'active'
    else
      @$el.removeClass 'active'