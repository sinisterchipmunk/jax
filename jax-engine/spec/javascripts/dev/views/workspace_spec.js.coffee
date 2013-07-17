describe 'Jax.Dev.Views.Workspace', ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    @workspace = new Jax.Dev.Views.Workspace

  describe 'assigning a view to it', ->
    beforeEach ->
      class V extends Backbone.View
        id: "assigned-view"
      @view = new V()
      @workspace.setView @view.$el

    it 'should attach the assigned view to its DOM', ->
      expect(@workspace.$("#assigned-view")).toBeDefined()
