describe "Jax.Dev.Views.ControllerListItem", ->
  beforeEach ->
    @model = new Jax.Dev.Models.ControllerListItem
      name: "one"
    @view = new Jax.Dev.Views.ControllerListItem
      model: @model

  it 'should be an li', ->
    expect(@view.el.nodeName).toEqual 'LI'

  it 'should contain a link to the controller', ->
    expect(@view.$("a").attr('href')).toMatch /^\#controllers\/one(\/|$)/

  it 'should contain the controller name', ->
    expect(@view.$el.text()).toMatch /one/
