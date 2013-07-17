describe 'Jax.Dev.Views.WebGLCanvas', ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    @view = new Jax.Dev.Views.WebGLCanvas

  it 'should give the canvas 1024x768 default resolution', ->
    expect(@view.$el.attr('width')).toEqual '1024'
    expect(@view.$el.attr('height')).toEqual '768'

  it 'should hook the jax context into window for console interfacing', ->
    expect(window.jax).toBe @view.jax

  it 'should create a jax context using its canvas', ->
    expect(@view.jax.canvas).toBe @view.el

  it 'should delegate jax controller redirects into its jax context', ->
    spyOn @view.jax, 'redirectTo'
    @view.startController 'name'
    expect(@view.jax.redirectTo).toHaveBeenCalledWith 'name'
