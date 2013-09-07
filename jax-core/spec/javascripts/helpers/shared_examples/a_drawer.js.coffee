sharedExamplesFor "a drawer", ->
  beforeEach ->
    @cloneSubject = =>
      new (@view.__proto__.constructor)(@view.options)

  beforeEach ->
    $("body").append @view.$el

  afterEach -> @view.$el.remove()

  it 'should be expanded by default', ->
    expect(@view.isExpanded()).toBe true

  describe 'collapsing the drawer', ->
    beforeEach ->
      @view.collapse()

    it 'should collapse the list', ->
      expect(@view.isCollapsed()).toBe true
      expect(parseInt @view.$el.css('height')).toBeLessThan 40

    it 'should persist', ->
      expect(@cloneSubject().isCollapsed()).toBe true

    describe 'toggling', ->
      beforeEach ->
        spyOn @view, 'expand'
        @view.toggle()

      it 'should expand', ->
        expect(@view.expand).toHaveBeenCalled()

    describe "expanding", ->
      beforeEach -> @view.expand()

      it 'should persist', ->
        expect(@cloneSubject().isCollapsed()).toBe false

      it 'should expand the list', ->
        expect(@view.isCollapsed()).toBe false
        expect(parseInt @view.$el.css('height')).not.toBeLessThan 40
