#= require 'jax/core'
#= require 'jax/renderer'
#= require 'jax/webgl'

class Jax.Context
  @include Jax.EventEmitter
  guid = 0
  
  constructor: (@canvas, options) ->
    # Normalize single-argument form
    if arguments.length is 1
      unless @canvas instanceof HTMLElement or (typeof @canvas) is "string"
        options = @canvas
        @canvas = options.canvas
        delete options.canvas
    if typeof(@canvas) is 'string'
      @canvas = document.getElementById(@canvas)

    @_isDisposed  = false
    @_isRendering = false
    @_isUpdating  = false
    @_renderHandle = @_updateHandle = null
    @_framesPerSecond = @_updatesPerSecond = 0
    
    @_updateFunc = =>
      timechange = @refreshUPS()
      @update timechange
      if @isUpdating() then @requestUpdateFrame()
      
    @_renderFunc = (time) =>
      @uptime = time
      if @_calculateFrameRate then @refreshFPS()
      @render()
      if @isRendering() then @requestRenderFrame()
      
    @id = guid++
    @world = new Jax.World this
    @uptime = 0
    @activeCamera = new Jax.Camera()
    @matrix_stack = new Jax.MatrixStack()
    @framerateSampleRatio = 0.9
    @updateSpeed = 33
    
    @setupCamera()
    @setupInputDevices()
    @setupRenderer options
    @startUpdating()
    @redirectTo options.root if options?.root
    
  @getter 'player', ->
    console.log new Error("Jax.Context#player is deprecated; it only contained `camera`, " + \
                          "so you should use Jax.Context#activeCamera instead.").stack
    @_player or= camera: @activeCamera
    
    
  isDisposed: -> @_isDisposed
  isRendering: -> @_isRendering
  isUpdating: -> @_isUpdating
  
  ###
  Reloads and resets the matrix stack. Meant to be called
  each frame, prior to rendering the scene. This is called
  by #render automatically. Returns the stack itself.
  ###
  reloadMatrices: ->
    @matrix_stack.reset() # reset depth
    @matrix_stack.loadModelMatrix mat4.IDENTITY
    # we use the inverse xform to go from WORLD to LOCAL instead of the opposite.
    @matrix_stack.loadViewMatrix @activeCamera.getInverseTransformationMatrix()
    @matrix_stack.loadProjectionMatrix @activeCamera.getProjectionMatrix()
    @matrix_stack
  
  update: (timechange) ->
    @controller?.update? timechange
    @world.update timechange
    
  prepare: ->
    @reloadMatrices()
    @renderer.prepare()
    
  viewport: ->
    @renderer.viewport()
    
  render: ->
    @prepare()
    if @view
      @view.render()
    else
      @renderer.clear()
      @world.render()
    
  refreshUPS: ->
    currentUpdateStart = @uptime
    @_lastUpdateStart or= currentUpdateStart
    timeToUpdateThisFrame = currentUpdateStart - @_lastUpdateStart
    
    if @_calculateUpdateRate
      @_timeToUpdate = (@_timeToUpdate || 0) * @framerateSampleRatio \
                     +  timeToUpdateThisFrame * (1 - @framerateSampleRatio)
      # update rate = seconds / time
      @_updatesPerSecond = @_timeToUpdate * 0.001
    
    # in order to avoid recalculating the above for updates, we'll
    # return the timechange to be used in subsequent updates.
    timechange = currentUpdateStart - @_lastUpdateStart
    @_lastUpdateStart = currentUpdateStart
    
    # clamp update rate to 250ms so that it doesn't spike when
    # resuming from a paused state
    Math.min timechange * 0.001, 0.25
    
  refreshFPS: ->
    currentRenderStart = @uptime
    @_lastRenderStart or= @uptime
    timeToRenderThisFrame = currentRenderStart - @_lastRenderStart
    
    @_timeToRender = (@_timeToRender || 0) * @framerateSampleRatio \
                   +  timeToRenderThisFrame * (1 - @framerateSampleRatio)
    
    # frames per second = 1 second divided by time to render;
    # time is currently in ms so 1sec = 1000ms
    @_framesPerSecond = @_timeToRender * 0.001
    @_lastRenderStart = currentRenderStart
    
  
  startUpdating: ->
    return if @isUpdating() or @isDisposed()
    @_isUpdating = true
    @requestUpdateFrame()
    
  startRendering: ->
    return if @isRendering() or @isDisposed()
    @_isRendering = true
    @requestRenderFrame()
    
  stopUpdating: ->
    return unless @isUpdating()
    @abortUpdateFrame()
    @_isUpdating = false

  stopRendering: ->
    return unless @isRendering()
    @abortRenderFrame() if @_renderHandle isnt null
    @_isRendering = false
    
  restart: ->
    @stopRendering()
    @stopUpdating()
    @startRendering()
    @startUpdating()
    
  requestUpdateFrame: ->
    currTime = new Date().getTime()
    timeToCall = Math.max 0, @updateSpeed - (currTime - (@_requestUpdateLastTime || 0))
    @_updateHandle = setTimeout @_updateFunc, timeToCall
    @_requestUpdateLastTime = currTime + timeToCall
    
  abortUpdateFrame: ->
    clearTimeout @_updateHandle if @_updateHandle isnt null
    @_updateHandle = null
  
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
    options = Jax.Util.normalizeOptions options,
      renderers: Jax.Renderer.registeredOrder
    return unless @canvas
    @renderer = Jax.Renderer.attemptThese @canvas, options.renderers, options
    # TODO deprecate `gl`, maybe around v3.1ish.
    @gl = @renderer.context
    
  ###
  Initializes input devices such as keyboard and mouse. These are tied
  to the @canvas, so if that is unavailable, nothing happens.
  ###
  setupInputDevices: ->
    if @canvas
      @mouse    = new Jax.Input.Mouse    @canvas if Jax.Input?.Mouse
      @keyboard = new Jax.Input.Keyboard @canvas if Jax.Input?.Keyboard
    
  redirectTo: (path) ->
    @unregisterListeners()
    @stopUpdating()
    @stopRendering()
    
    descriptor = Jax.routes.recognizeRoute path
    if descriptor.action != 'index' && @controller && @controller instanceof descriptor.controller
      # already within the routed controller, just redirect to a different
      # view, or fire an action and stay with the same view
      @controller.fireAction descriptor.action
      if Jax.views.exists @controller.view_key
        @view = Jax.views.find @controller.view_key
        @setupView @view
    else
      @unloadScene()
      @controller = Jax.routes.dispatch path, this
      @view = Jax.views.find @controller.view_key
      @setupView @view if @view
    
    @registerListeners()
    @startRendering()
    @startUpdating()
    @controller
    
  setupView: (view) ->
    view.context = this
    view.world = @world
    view
    
  unloadScene: ->
    @world.dispose()
    @world.cameras = 1
    @activeCamera = @world.cameras[0]
    @setupCamera()
    delete @_player # TODO remove this line when deprecated `player` is removed!
    
  setupCamera: ->
    if @canvas
      @activeCamera.perspective
        width:  @canvas.clientWidth  || @canvas.width
        height: @canvas.clientHeight || @canvas.height
    
  dispose: ->
    @stopUpdating()
    @stopRendering()
    @world.dispose()
    @unregisterListeners()
    @_isDisposed = true
    
  registerListeners: ->
    return unless @controller
    if @mouse
      if @controller.mouse_pressed  then @mouse.listen 'press',      (evt) => 
        @controller.mouse_pressed  evt
      if @controller.mouse_released then @mouse.listen 'release',    (evt) =>
        @controller.mouse_released evt
      if @controller.mouse_clicked  then @mouse.listen 'click',      (evt) =>
        @controller.mouse_clicked  evt
      if @controller.mouse_moved    then @mouse.listen 'move',       (evt) =>
        @controller.mouse_moved    evt
      if @controller.mouse_entered  then @mouse.listen 'enter',      (evt) =>
        @controller.mouse_entered  evt
      if @controller.mouse_exited   then @mouse.listen 'exit',       (evt) =>
        @controller.mouse_exited   evt
      if @controller.mouse_dragged  then @mouse.listen 'drag',       (evt) =>
        @controller.mouse_dragged  evt
      if @controller.mouse_over     then @mouse.listen 'over',       (evt) =>
        @controller.mouse_over     evt
    if @keyboard
      if @controller.key_pressed    then @keyboard.listen 'press',   (evt) =>
        @controller.key_pressed    evt
      if @controller.key_released   then @keyboard.listen 'release', (evt) =>
        @controller.key_released   evt
      if @controller.key_typed      then @keyboard.listen 'type',    (evt) =>
        @controller.key_typed      evt
    true
    
  unregisterListeners: ->
    @mouse.stopListening()    if @mouse
    @keyboard.stopListening() if @keyboard

  getUpdatesPerSecond: ->
    @_calculateUpdateRate = true
    return @_updatesPerSecond
    
  getFramesPerSecond: ->
    @_calculateFrameRate = true
    return @_framesPerSecond
    
  disableUpdateSpeedCalculations: ->
    @_calculateUpdateRate = false
    
  disableFrameSpeedCalculations: ->
    @_calculateFrameRate = false
    