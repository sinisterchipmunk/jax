describe "Jax.Dev.Views.TabSet", ->
  _view = null

  beforeEach ->
    _view = @view = new Jax.Dev.Views.TabSet
      tabs:
        "One": @one = new Backbone.View(el: $("<p>Hello, world!</p>")[0])
        "Two": @two = new Backbone.View(el: $("<p>Goodbye, cruel world!</p>")[0])

  visible = ->
    clone = _view.$el.clone()
    $('body').append(clone)
    clone.find("*").filter(-> not $(this).is(":visible")).remove()
    clone.remove()
    clone

  it 'should render One by default', ->
    expect(visible().text()).toMatch /Hello, world/

  it 'should not render Two by default', ->
    expect(visible().text()).not.toMatch /Goodbye, cruel world/

  it 'should render both tabs', ->
    expect(visible().find(".tab:contains('One')")).not.toBeEmpty()
    expect(visible().find(".tab:contains('Two')")).not.toBeEmpty()

  it 'should make the first tab active', ->
    expect(visible().find(".tab.active").text()).toMatch /One/

  it 'should not make the second tab active', ->
    expect(visible().find(".tab.active").text()).not.toMatch /Two/

  it 'should delegate #cancel into the current view', ->
    @one.cancel = ->
    spyOn @one, 'cancel'
    @view.cancel()
    expect(@one.cancel).toHaveBeenCalled()

  describe "clicking on tab Two", ->
    beforeEach ->
      @view.$(".tab:contains('Two')").click()

    it "should make the second tab active", ->
      expect(visible().find(".tab.active").text()).toMatch /Two/

    it "should make the first tab not active", ->
      expect(visible().find(".tab.active").text()).not.toMatch /One/

    it "should make second tab content visible", ->
      expect(visible().text()).toMatch /Goodbye, cruel world/

    it "should make the first tabe content not visible", ->
      expect(visible().text()).not.toMatch /Hello, world/

    it 'should delegate #cancel into the current view', ->
      @two.cancel = ->
      spyOn @two, 'cancel'
      @view.cancel()
      expect(@two.cancel).toHaveBeenCalled()
