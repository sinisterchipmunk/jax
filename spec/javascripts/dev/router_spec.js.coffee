describe "Jax.Dev.Router", ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    @router = new Jax.Dev.Router
    spyOn @router.workspace, 'setView'
    spyOn Jax.Dev.Views.Runtime.prototype, 'startController'

  describe 'default url', ->
    beforeEach ->
      Backbone.history.loadUrl ''

    it 'should load a runtime view', ->
      expect(@router.workspace.setView).toHaveBeenCalledWithInstanceOf Jax.Dev.Views.Runtime

  describe 'a url with a controller name', ->
    beforeEach ->
      Backbone.history.loadUrl 'controllers/name'

    it 'should start the specified controller', ->
      expect(Jax.Dev.Views.Runtime.prototype.startController).toHaveBeenCalledWith 'name'
