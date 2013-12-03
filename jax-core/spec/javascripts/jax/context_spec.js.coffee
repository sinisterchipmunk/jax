describe 'Jax.Context', ->
  beforeEach ->
    Jax.useRequestAnimFrame = false
    jasmine.Clock.useMock()
  afterEach -> Jax.useRequestAnimFrame = true

  # not sure this actually should be the case

  # describe 'after pixel width changes', ->
  #   beforeEach ->
  #     @context.canvas.width = 1

  #   describe 'rendering', ->
  #     beforeEach ->
  #       spyOn @context, 'setupCamera'
  #       @context.render()

  #     it 'should set up the camera again', ->
  #       expect(@context.setupCamera).toHaveBeenCalled()

  # describe 'after pixel height changes', ->
  #   beforeEach ->
  #     @context.canvas.height = 1

  #   describe 'rendering', ->
  #     beforeEach ->
  #       spyOn @context, 'setupCamera'
  #       @context.render()

  #     it 'should set up the camera again', ->
  #       expect(@context.setupCamera).toHaveBeenCalled()

  describe 'after clientWidth changes', ->
    beforeEach ->
      $(@context.canvas).css('width', '1px')

    describe 'rendering', ->
      beforeEach ->
        spyOn @context, 'setupCamera'
        @context.render()

      it 'should set up the camera again', ->
        expect(@context.setupCamera).toHaveBeenCalled()

  describe 'after clientHeight changes', ->
    beforeEach ->
      $(@context.canvas).css('height', '1px')

    describe 'rendering', ->
      beforeEach ->
        spyOn @context, 'setupCamera'
        @context.render()

      it 'should set up the camera again', ->
        expect(@context.setupCamera).toHaveBeenCalled()
  
  it 'should have an id', -> expect(@context.id).not.toBeUndefined()
  it 'should have a world', -> expect(@context.world).toBeInstanceOf Jax.World
  it 'should set uptime to 0', -> expect(@context.uptime).toEqual 0
  it 'should have a camera', ->
    expect(@context.activeCamera).toBeInstanceOf Jax.Camera
  it 'should have a matrix stack', ->
    expect(@context.matrix_stack).toBeInstanceOf Jax.MatrixStack
  it 'should init framerate to 0', -> 
    expect(@context.getFramesPerSecond()).toEqual 0
  it 'should have a default framerate sample ratio', -> 
    expect(@context.framerateSampleRatio).toBeDefined()
  it 'should not be disposed', -> expect(@context).not.toBeDisposed()
  it 'should be updating', -> expect(@context).toBeUpdating()
  it 'should not be rendering', -> expect(@context).not.toBeRendering()
  it 'should keep a handle to the canvas', ->
    expect(@context.canvas).toBe document.getElementById('spec-canvas')

  describe "given a canvas ID that cannot be resolved", ->
    it "should raise an error", ->
      expect(-> new Jax.Context "nonexistent").toThrow("Could not locate canvas element with ID 'nonexistent'")

  describe "given a falsy but not undefined canvas", ->
    it "should raise an error", ->
      expect(-> new Jax.Context null).toThrow("Received `null` where a canvas was expected! If you meant to initialize Jax without a canvas, don't pass any value at all for one.")

  describe "given a non-canvas target and an empty list of renderers", ->
    div = null
    clicked = indexed = null
    beforeEach ->
      clicked = indexed = false
      div = document.createElement 'div'
      document.body.appendChild div
      Jax.views.push "welcome/index", ->
      @controller = new class Controller extends Jax.Controller
        views:
          index: 'welcome/index'
        index: -> indexed = true
        mouse_clicked: -> clicked = true
      @context = new Jax.Context canvas: div, renderers: []
      @context.redirect @controller

    it "should dispatch events properly", ->
      @context.mouse.trigger 'click'
      expect(clicked).toBeTrue()

    it "should fire controller actions", ->
      expect(indexed).toBeTrue()

    it "should execute views", ->
      spyOn @context, 'render'
      jasmine.Clock.tick 1000
      expect(@context.render).toHaveBeenCalled()

    it "should call update", ->
      spyOn @context, 'update'
      jasmine.Clock.tick 1000
      expect(@context.update).toHaveBeenCalled()

  it "should apply projection to new cameras if they don't have one", ->
    @context.redirect new Jax.Controller() # controller required
    @context.render() # control
    @context.activeCamera = new Jax.Camera
    @context.render() # should setup projection
    expect(@context.activeCamera.get('projection').type).toEqual 'perspective'
  
  it "should not apply projection to new cameras if they already have one", ->
    @context.redirect new Jax.Controller() # controller required
    @context.render() # control
    @context.activeCamera = new Jax.Camera
    @context.activeCamera.ortho
      left: -1
      right: 1
      bottom: -1
      top: 1
    @context.render() # should setup projection
    expect(@context.activeCamera.get('projection').type).toEqual 'orthographic'
  
  it 'should find canvas by id', ->
    c = new Jax.Context @context.canvas.getAttribute 'id'
    expect(c.canvas).toBe @context.canvas
  
  it 'should pass webgl options into the renderer', ->
    c = new Jax.Context document.createElement('canvas'),
      preserveDrawingBuffer: true
    expect(c.renderer.options.preserveDrawingBuffer).toBe true
  
  describe "handling errors", ->
    context = error = null
    beforeEach ->
      error = shouldResume = null
      @test = new class Test extends Jax.Controller
        fail: -> throw new Error()
        nofail: -> 
      context = new Jax.Context(document.createElement('canvas'))

    it "should halt rendering", ->
      expect(=> context.redirect @test, 'fail').toThrow()
      expect(context.isRendering()).toBeFalse()
      expect(context.isUpdating()).toBeFalse()

    it "should be rendering if no failure occurred", ->
      expect(=> context.redirect @test, 'nofail').not.toThrow()
      expect(context.isRendering()).toBeTrue()
      expect(context.isUpdating()).toBeTrue()
    
  describe "redirecting", ->
    Two = null
    beforeEach ->
      @one = new class One extends Jax.Controller
        views:
          index: 'one/index'
        index: ->
      @two = new class Two extends Jax.Controller
        views:
          index: 'two/index'
        index: -> @world.addObject new Jax.Model()
        second: ->
        update: (tc) ->
      Jax.views.push 'one/index', ->
      Jax.views.push 'two/index', ->
        
    it 'should return the controller it redirected to', ->
      result = @context.redirect @two
      expect(result).toBe @two
        
    it 'should render views when it has them', ->
      @context.redirect @two
      spyOn @context.controller, 'view'
      jasmine.Clock.tick 1000
      expect(@context.controller.view).toHaveBeenCalled()
      
    it 'should make world accessible to views', ->
      @context.redirect @two
      expect(@context.controller.world).toBe @context.world
      
    it 'should make context accessible to views', ->
      @context.redirect @two
      expect(@context.controller.context).toBe @context
      
    describe 'scene unloading', ->
      it 'should reset the camera', ->
        @context.redirect @two
        @context.activeCamera.setPosition [1,1,1]
        @context.unloadScene()
        expect(@context.activeCamera.get('position')).toEqualVector [0,0,0]

    describe 'to the index action in the same controller', ->
      it "should reload the scene as a special case", ->
        # normally redirection within the same controller won't unload
        # the scene, but a redirect to `index` indicates the scene should
        # be reloaded.
        @context.redirect @two
        controller = @context.controller
        spyOn @context, 'unloadScene'
        @context.redirect @two
        expect(@context.unloadScene).toHaveBeenCalled()
          
    describe 'to a different action in the same controller', ->
      originalView = null
      beforeEach ->
        @context.redirect @two
        originalView = @context.controller.view
      
      describe 'without a view', ->
        beforeEach ->
          @context.redirect @two, 'second'
          
        it 'should not unload the world', ->
          expect(@context.world.objects).not.toBeEmpty()
          
        it 'should not change the view', ->
          expect(@context.controller.view).toBe originalView
          
      describe 'with a view', ->
        beforeEach ->
          @two.views.second = 'two/second'
          Jax.views.push 'two/second', ->
          @context.redirect @two, 'second'
          
        it "should use the new view", ->
          expect(@context.controller.view).not.toBe originalView
          
        it "should not unload the world", ->
          expect(@context.world.objects).not.toBeEmpty()
          
    describe "to a different controller", ->
      originalView = null
      beforeEach ->
        @context.redirect @one
        originalView = @context.controller.view
        @context.redirect @two
        
      it "should initialize the new view", ->
        expect(@context.controller.view).not.toBe originalView
        
      it "should dispose of the world", ->
        spyOn @context.world, 'dispose'
        @context.redirect @one
        expect(@context.world.dispose).toHaveBeenCalled()
        
      it "should reset the active camera", ->
        expect(@context.activeCamera).toBe @context.world.cameras[0]
        
    describe "to a bad route", ->
      it "should throw an error", ->
        expect(=> @context.redirect @one, 'invalid').toThrow "Action 'invalid' not found"
        
      it "should stop updating", ->
        @context.redirect @two
        spyOn @context.controller, 'update'
        try
          @context.redirect @two, 'invalid'
        catch e
          1 # no op
        jasmine.Clock.tick 1000
        expect(@context.controller.update).not.toHaveBeenCalled()
        
      it "should stop rendering", ->
        @context.redirect @one
        spyOn @context.world, 'render'
        try
          @context.redirect @one, 'invalid'
        catch e
          1 # no op
        jasmine.Clock.tick 1000
        expect(@context.world.render).not.toHaveBeenCalled()
  
  describe 'disposal', ->
    it 'should dispose its world', ->
      spyOn @context.world, 'dispose'
      @context.dispose()
      expect(@context.world.dispose).toHaveBeenCalled()
  
  describe 'after disposal', ->
    beforeEach -> @context.dispose()
    
    it "should be disposed", -> expect(@context).toBeDisposed()
    it "should not be rendering", -> expect(@context).not.toBeRendering()
    it "should not be updating", -> expect(@context).not.toBeUpdating()
    
    it "should not start updating", ->
      @context.startUpdating()
      expect(@context).not.toBeUpdating()
      spyOn @context, 'update'
      jasmine.Clock.tick 1000
      expect(@context.update).not.toHaveBeenCalled()
      
    it "should not start rendering", ->
      @context.startRendering()
      expect(@context).not.toBeRendering()
      spyOn @context, 'render'
      jasmine.Clock.tick 1000
      expect(@context.render).not.toHaveBeenCalled()
    
  describe 'at a controller with an update method', ->
    beforeEach ->
      test = new class Test extends Jax.Controller
        update: (tc) ->
      @context.redirect test
      
    it "should update its world", ->
      spyOn @context.world, 'update'
      jasmine.Clock.tick 1000
      expect(@context.world.update).toHaveBeenCalled()
      
    it "should perform controller updates", ->
      spyOn @context.controller, 'update'
      jasmine.Clock.tick 1000
      expect(@context.controller.update).toHaveBeenCalled()
      
    it "should perform renders", ->
      spyOn @context, 'render'
      jasmine.Clock.tick 1000
      expect(@context.render).toHaveBeenCalled()
  
  it "should accept a canvas as an option", ->
    context = new Jax.Context canvas: @context.canvas
    expect(context.canvas).toBe @context.canvas
  
  describe "given a root controller", ->
    TestController = null
    beforeEach ->
      class TestController extends Jax.Controller
      @context = new Jax.Context @context.canvas, root: new TestController
      
    it "redirect there immediately", ->
      expect(@context.controller).toBeInstanceOf TestController
  
  describe "with a canvas and no options", ->
    it "should initialize a renderer", ->
      context = new Jax.Context @context.canvas
      expect(context.renderer).toBeDefined()
      
    it "should set perspective mode on the camera", ->
      context = new Jax.Context @context.canvas
      expect(context.activeCamera.get('projection').type).toEqual 'perspective'
    
  describe "with no arguments", ->
    it "should not initialize a renderer", ->
      context = new Jax.Context()
      expect(context.renderer).toBeUndefined()
  
  describe "without a controller", ->
    it "should not have a controller (sanity check)", ->
      expect(@context.controller).toBeUndefined()
    
    it "should not register any event listeners on the canvas", ->
      expect($(@context.canvas).data("events")).toBeUndefined()
        
  describe "at a controller with every possible callback", ->
    beforeEach ->
      @test = new class Test extends Jax.Controller
        mouse_clicked: (e) ->
        mouse_pressed: (e) ->
        mouse_released: (e) ->
        mouse_moved: (e) ->
        mouse_dragged: (e) ->
        mouse_scrolled: (e) ->
        mouse_entered: (e) ->
        mouse_exited: (e) ->
        mouse_over: (e) ->
        key_pressed: (e) ->
        key_released: (e) ->
        key_typed: (e) ->
      @context.redirect @test

    describe "after disposing the context", ->
      beforeEach -> @context.dispose()
        
      it "should remove all event listeners from its canvas", ->
        expect($(@context.canvas).data("events")).toBeUndefined()
