describe 'Jax.Dev.Views.ControllerList', ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    class M extends Backbone.Model
    class C extends Backbone.Collection
      model: M
    @collection = new C [{}]
    @view = new Jax.Dev.Views.ControllerList
      collection: @collection

  it 'should build a new view for each model', ->
    spyOn @view, 'add'
    @view.render()
    expect(@view.add).toHaveBeenCalled()

  it 'should be a ul', ->
    # because we also spec that ControllerListItem must be an li
    expect(@view.el.nodeName).toEqual 'UL'
