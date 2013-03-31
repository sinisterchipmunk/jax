describe "Jax.Dev.Views.Tools.World", ->
  beforeEach ->
    @view = new Jax.Dev.Views.Tools.World
      context: @context
    @context.startRendering()
    @context.startUpdating()

  it 'should disable "draw frame"', ->
    expect(@view.$("#draw-frame")).toBeDisabled()

  it 'should disable "tick"', ->
    expect(@view.$("#tick")).toBeDisabled()

  it 'should disable tick seconds', ->
    expect(@view.$("#tick-seconds")).toBeDisabled()

  describe 'when rendering has been stopped', ->
    beforeEach -> @view.$(".stop-rendering").click()

    it 'should stop rendering, duh', ->
      expect(@context).not.toBeRendering()

    it 'should enable "draw frame"', ->
      expect(@view.$("#draw-frame")).toBeEnabled()

    describe 'clicking "draw frame"', ->
      beforeEach ->
        spyOn @context, 'render'
        @view.$("#draw-frame").click()

      it 'should draw a single frame', ->
        expect(@context.render).toHaveBeenCalled()

  describe 'when updating has been stopped', ->
    beforeEach -> @view.$(".stop-updating").click()

    it 'should stop updating, duh', ->
      expect(@context).not.toBeUpdating()

    it 'should enable "tick"', ->
      expect(@view.$("#tick")).toBeEnabled()

    it 'should enable tick seconds', ->
      expect(@view.$("#tick-seconds")).toBeEnabled()

    describe 'clicking "tick" with number of seconds', ->
      beforeEach ->
        spyOn @context, 'update'
        @view.$("#tick-seconds").val '1.25'
        @view.$("#tick").click()

      it 'should update once with specified seconds', ->
        expect(@context.update).toHaveBeenCalledWith(1.25)
