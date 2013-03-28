describe "Jax.Dev.Views.Runtime", ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    @view = new Jax.Dev.Views.Runtime

  it 'should include a webgl canvas', ->
    expect(@view.$("canvas")).not.toBeEmpty()

  it 'should delegate #startController into the webgl canvas', ->
    spyOn Jax.Dev.Views.WebGLCanvas.prototype, 'startController'
    @view.startController 'name'
    expect(Jax.Dev.Views.WebGLCanvas.prototype.startController).toHaveBeenCalledWith 'name'

  it 'should contain a controller list', ->
    spyOn Jax.Dev.Views.ControllerList.prototype, 'render'
    new Jax.Dev.Views.Runtime
    expect(Jax.Dev.Views.ControllerList.prototype.render).toHaveBeenCalled()
