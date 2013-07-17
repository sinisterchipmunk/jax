describe 'Jax.Dev.Views.ControllerList', ->
  beforeEach ->
    Jax.Controller.create "jax", {}
    class M extends Backbone.Model
    class C extends Backbone.Collection
      model: M
    @collection = new C [{}]
    @view = new Jax.Dev.Views.ControllerList
      collection: @collection

  itShouldBehaveLike "a drawer"

  it 'should build a new view for each model', ->
    spyOn @view, 'add'
    @view.render()
    expect(@view.add).toHaveBeenCalled()

  it 'should be a ul', ->
    # because we also spec that ControllerListItem must be an li
    expect(@view.el.nodeName).toEqual 'UL'

  describe 'clicking the minify button', ->
    beforeEach ->
      $.fx.off = true
      $("body").append @view.$el
      @view.$("a.minify").click()

    afterEach -> @view.$el.remove()

    it 'should collapse the list', ->
      expect(@view.isCollapsed()).toBe true
      expect(parseInt @view.$el.css('height')).toBeLessThan 30

    it 'should persist', ->
      newView = new Jax.Dev.Views.ControllerList collection: @collection
      expect(newView.isCollapsed()).toBe true

    describe 'clicking again', ->
      beforeEach ->
        @view.$("a.minify").click()

      it 'should persist', ->
        newView = new Jax.Dev.Views.ControllerList collection: @collection
        expect(newView.isCollapsed()).toBe false

      it 'should expand the list', ->
        expect(@view.isCollapsed()).toBe false
        expect(parseInt @view.$el.css('height')).not.toBeLessThan 30
