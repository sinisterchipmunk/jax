describe "Jax.Dev.Views.Tools", ->
  beforeEach ->
    @view = new Jax.Dev.Views.Tools context: @context

  itShouldBehaveLike "a drawer"

  it 'should include tabbed views for world settings', ->
    expect(@view.$(".tab").text()).toMatch /World/

  it 'should include tabbed views for light settings', ->
    expect(@view.$(".tab").text()).toMatch /Lights/

  it 'should include tabbed views for model settings', ->
    expect(@view.$(".tab").text()).toMatch /Models/

  it 'should include tabbed views for material settings', ->
    expect(@view.$(".tab").text()).toMatch /Materials/

  describe 'clicking the header', ->
    beforeEach ->
      $("body").append(@view.$el)
      @view.$("a.tools").click()

    afterEach -> @view.$el.remove()

    it 'should collapse the tools', ->
      expect(@view.$el.height()).toBeLessThan 30

    describe 'clicking it again', ->
      beforeEach ->
        @view.$("a.tools").click()

      it 'should expand the tools', ->
        expect(@view.$el.height()).toBeGreaterThan 30