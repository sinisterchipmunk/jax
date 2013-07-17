describe "Jax.Dev.Views.Drawer", ->
  class TestDrawer extends Jax.Dev.Views.Drawer
    stateKey: "test_drawer"

    initialize: ->
      @render()
      @restoreState()

    render: =>
      @$el.html '<div style="width: 500px; height: 500px;"></div>'

  beforeEach ->
    @view = new TestDrawer

  itShouldBehaveLike "a drawer"
