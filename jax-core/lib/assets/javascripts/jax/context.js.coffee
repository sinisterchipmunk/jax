#= require 'jax/core'
#= require 'jax/renderer'
#= require 'jax/mixins/event_emitter'

class Jax.Context
  @include Jax.Mixins.EventEmitter
  
  constructor: (@canvas, options) ->
    # Normalize single-argument form
    if @canvas and arguments.length is 1
      unless @canvas instanceof HTMLElement or (typeof @canvas) is "string"
        options = @canvas
        @canvas = options.canvas
        delete options.canvas
    if typeof(@canvas) is 'string'
      canvas = document.getElementById(@canvas)
      unless canvas
        throw new Error "Could not locate canvas element with ID '#{@canvas}'"
      @canvas = canvas
    options or= {}
    if !@canvas and @canvas isnt undefined
      throw new Error "Received `#{@canvas}` where a canvas was expected! If you meant to initialize Jax without a canvas, don't pass any value at all for one."

    # clamp update rate to 250ms so that it doesn't spike when
    # resuming from a paused state
    @clampTimechange = 0.25
    @_isDisposed  = false
    @_isRendering = false
    @_isUpdating  = false
    @_renderHandle = @_updateHandle = null
    @_framesPerSecond = 0
    @_renderStartTime = null
    @inputDevices = []
    
    @_renderFunc = (time) =>
      # deal with time in seconds, not ms
      time *= 0.001
      renderStartTime = @_renderStartTime or= time
      @_lastUptime = @uptime || renderStartTime
      @uptime = time - renderStartTime

      if @_calculateFrameRate then @calculateFramerate()
      if @isUpdating()
        timechange = @getTimePassed()
        @update timechange
      @render()
      if @isRendering() then @requestRenderFrame()
      
    @id = Jax.guid()
    @world = new Jax.World this
    @uptime = 0
    @matrix_stack = new Jax.MatrixStack()
    @framerateSampleRatio = 0.9
    
    @setupRenderer options
    @setupCamera()
    @setupInputDevices options.focus
    @startUpdating()
    @redirect options.root if options.root
    
  @getter 'player', ->
    console.log new Error("Jax.Context#player is deprecated; it only contained `camera`, " + \
                          "so you should use Jax.Controller#activeCamera instead.").stack
    camera: @activeCamera
    
  @define 'activeCamera',
    set: (c) -> @controller?.activeCamera = c
    get: ->
      if @controller then @controller.activeCamera
      else @world.cameras[0]
    
  isDisposed: -> @_isDisposed
  isRendering: -> @_isRendering
  isUpdating: -> @_isUpdating
  
  ###
  Reloads and resets the matrix stack. Meant to be called
  each frame, prior to rendering the scene. This is called
  by #render automatically. Returns the stack itself.
  ###
  reloadMatrices: ->
    camera = @activeCamera
    @matrix_stack.reset() # reset depth
    @matrix_stack.loadModelMatrix mat4.IDENTITY
    @matrix_stack.loadViewMatrix camera.get('inverseMatrix')
    @matrix_stack.loadProjectionMatrix camera.get('projection').matrix
    @matrix_stack
  
  update: (timechange) ->
    device.update timechange for device in @inputDevices
    @controller?.update? timechange
    @world.update timechange
    @activeCamera.update timechange

  ###
  Returns true if the active camera has no projection (e.g. neither
  `perspective` nor `ortho` has been called on it yet), or if the canvas
  size has changed since the last call to `setupCamera`.
  ###
  isViewportStale: ->
    camera = @activeCamera
    return true if camera.get('projection').type is 'identity'
    return true if @_realViewportWidth  isnt @canvas.clientWidth
    return true if @_realViewportHeight isnt @canvas.clientHeight
    false
    
  prepare: ->
    @setupCamera() if @isViewportStale()
    @reloadMatrices()
    @renderer.prepare()
    
  viewport: ->
    @renderer.viewport()
    
  render: ->
    @prepare()
    if @controller?.view
      @controller.view()
    else
      @renderer.clear()
      @world.render()
    
  getTimePassed: ->
    uptime = @uptime
    timechange = uptime - @_lastUptime
    timechange = 0 if timechange < 0

    if clampValue = @clampTimechange
      Math.min timechange, clampValue
    else
      timechange
    
  calculateFramerate: ->
    uptime = @uptime
    currentRenderStart = uptime
    sampleRatio = @framerateSampleRatio
    @_lastRenderStart or= uptime
    timeToRenderThisFrame = currentRenderStart - @_lastRenderStart
    
    @_timeToRender = (@_timeToRender || 0) * sampleRatio \
                   +  timeToRenderThisFrame * (1 - sampleRatio)
    
    # frames per second = 1 second divided by time to render
    @_framesPerSecond = 1 / @_timeToRender
    @_lastRenderStart = currentRenderStart
    
  
  startUpdating: ->
    return if @isUpdating() or @isDisposed()
    @_isUpdating = true
    
  startRendering: ->
    return if @isRendering() or @isDisposed()
    @_isRendering = true
    @requestRenderFrame()
    
  stopUpdating: ->
    return unless @isUpdating()
    @_isUpdating = false

  stopRendering: ->
    return unless @isRendering()
    @abortRenderFrame() if @_renderHandle isnt null
    @_renderStartTime = null
    @_isRendering = false
    
  restart: ->
    @stopRendering()
    @stopUpdating()
    @startRendering()
    @startUpdating()
    
  requestRenderFrame: ->
    if Jax.useRequestAnimFrame and @useRequestAnimFrame
      @_requestedAnimFrame = true
      @_renderHandle = requestAnimationFrame @_renderFunc, @canvas
    else
      @_requestedAnimFrame = false
      # the option not to use animFrame makes it easier to write tests
      currTime = new Date().getTime()
      timeToCall = Math.max 0, 16 - (currTime - (@_requestFrameLastTime || 0))
      @_renderHandle = setTimeout (=> @_renderFunc currTime + timeToCall), timeToCall
      @_requestFrameLastTime = currTime + timeToCall
      
  abortRenderFrame: ->
    if @_requestedAnimFrame
      cancelAnimationFrame @_renderHandle
    else
      clearTimeout @_renderHandle
    @_renderHandle = null
  
  ###
  Sets up a rendering context which depends on @canvas. If @canvas was
  not supplied during initialization, nothing happens.
  ###
  setupRenderer: (options) ->
    return unless @canvas
    options or= {}
    renderers = options.renderers || Jax.Renderer.registeredOrder
    if renderers.length
      @renderer = Jax.Renderer.attemptThese @canvas, renderers, options
      # TODO deprecate `gl`, maybe around v3.1ish.
      @gl = @renderer.context
    
  ###
  Initializes input devices such as keyboard and mouse. These are tied
  to the @canvas, so if that is unavailable, nothing happens.
  
  If `focusCanvas` is true, and keyboard input is used, the canvas will be
  given a tab index and programmatically focused. This can be passed as an
  initialization option to `Jax.Context`.
  ###
  setupInputDevices: (focusCanvas = true) ->
    if @canvas
      for Device in Jax.Input.devices
        device = new Device @canvas, focus: focusCanvas
        @[device.alias] = device if device.alias
        @inputDevices.push device
    
  redirect: (controller, action = 'index') ->
    @unregisterListeners()
    @stopUpdating()
    @stopRendering()

    if typeof controller is 'string'
      [controller, action] = [@controller, controller]

    if controller isnt @controller or action is 'index'
      @unloadScene()

    @controller = controller
    controller.fireAction action, this
    
    @registerListeners()
    @startRendering()
    @startUpdating()
    @controller
    
  unloadScene: ->
    @world.dispose()
    @world.cameras = 1
    @world.cameras[0].reset()
    @setupCamera()
    delete @_player # TODO remove this line when deprecated `player` is removed!
    
  setupCamera: ->
    if @world and @canvas
      @_realViewportWidth  = @canvas.clientWidth
      @_realViewportHeight = @canvas.clientHeight
      @activeCamera.perspective
        width:  @canvas.clientWidth  || @canvas.width  || 320
        height: @canvas.clientHeight || @canvas.height || 200
    
  dispose: ->
    @stopUpdating()
    @stopRendering()
    @world.dispose()
    @unregisterListeners()
    @_isDisposed = true
    
  registerListeners: ->
    return unless @controller
    for device in @inputDevices
      device.register @controller
    true
    
  unregisterListeners: ->
    for device in @inputDevices
      device.stopListening()
    true

  getFramesPerSecond: ->
    @_calculateFrameRate = true
    return @_framesPerSecond
    
  disableFrameSpeedCalculations: ->
    @_calculateFrameRate = false
    