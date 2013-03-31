describe "Jax.Dev.Views.Tools.World", ->
  beforeEach ->
    @view = new Jax.Dev.Views.Tools.World
      context: @context
    @context.startRendering()
    @context.startUpdating()

  describe 'when rendering has been stopped', ->
    beforeEach -> @view.$(".stop-rendering").click()

    it 'should stop rendering, duh', ->
      expect(@context).not.toBeRendering()

  describe 'when updating has been stopped', ->
    beforeEach -> @view.$(".stop-updating").click()

    it 'should stop updating, duh', ->
      expect(@context).not.toBeUpdating()

