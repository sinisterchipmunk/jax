class Jax.Input.Mouse extends Jax.Input
  Jax.Input.devices.push this

  alias: 'mouse'
  
  register: (controller) ->
    if controller.mouse_pressed
      @attach 'mousedown', @press
      @on 'press', (event) -> controller.mouse_pressed event
    if controller.mouse_released
      @attach 'mouseup',   @release
      @on 'release', (event) -> controller.mouse_released event
    if controller.mouse_clicked
      @attach 'mousedown', @press
      @attach 'mouseup', @release
      @attach 'mousemove', @move
      @on 'click', (event) -> controller.mouse_clicked event
    if controller.mouse_moved
      @attach 'mousedown', @press
      @attach 'mouseup', @release
      @attach 'mousemove', @move
      @attach 'mouseout', @exit
      @on 'move', (event) -> controller.mouse_moved event
    if controller.mouse_entered
      @attach 'mouseover', @over
      @attach 'mouseout', @exit
      @on 'enter', (event) -> controller.mouse_entered event
    if controller.mouse_exited
      @attach 'mouseout', @exit
      @on 'exit', (event) -> controller.mouse_exited event
    if controller.mouse_dragged
      @attach 'mousemove', @move
      @attach 'mousedown', @press
      @attach 'mouseup', @release
      @attach 'mouseout', @exit
      @on 'drag', (event) -> controller.mouse_dragged event
    if controller.mouse_rolled
      @attach 'mousewheel', @wheel
      @attach 'DOMMouseScroll', @wheel
      @on 'wheel', (event) -> controller.mouse_rolled event
    if controller.mouse_over
      @attach 'mouseover', @over
      @on 'over', (event) -> controller.mouse_over event

  ###
  Click speed, in seconds. The lower this number, the faster the
  mouse must be pressed and released in order to result in a single click.
  Defaults to 0.25.
  ###
  @define 'clickSpeed',
    get: -> @_clickSpeed or= 0.25
    set: (speed) -> @_clickSpeed = speed
  
  constructor: (element) ->
    super element
    @_pendingClicks = {}
    @_clickCount = {}
    @_buttonState = {}
  
  processEvent: (type, evt) ->
    evt = @normalizeEvent evt
    super type, evt
    
  ###
  Preprocesses the mouse event, adding the following attributes:
  
  * `x`: the X coordinate of the mouse event, relative to the
         @receiver element, in pixels, scaled from the element's
         actual size to the size of the element's render buffer.
  * `y`: the Y coordinate of the mouse event, relative to the
         @receiver element, in pixels, scaled from the element's
         actual size to the size of the element's render buffer.
  * `diffx`: the change in `x` between the last event and this
  * `diffy`: the change in `y` between the last event and this
  
  Returns the normalized event.
  ###
  normalizeEvent: (evt) ->
    offset = @receiver.offset()
    evt.x = (evt.pageX - offset.left) * @receiver[0].width / @receiver.width()
    evt.y = (evt.pageY - offset.top)  * @receiver[0].height/ @receiver.height()
    if @_lastx is undefined
      evt.diffx = evt.diffy = 0
    else
      [evt.diffx, evt.diffy] = [evt.x - @_lastx, evt.y - @_lasty]
    [@_tmplastx, @_tmplasty] = [evt.x, evt.y]
    evt
  
  update: (timechange) ->
    super timechange
    [@_lastx, @_lasty] = [@_tmplastx, @_tmplasty]
    for button of @_pendingClicks
      @_pendingClicks[button] += timechange
      if @_pendingClicks[button] >= @clickSpeed
        @clearClick button
    true
    
  logClickStart: (button) ->
    @_pendingClicks[button] = 0
    @_clickCount[button] = (@_clickCount[button] || 0) + 1
    
  clearClick: (button) ->
    delete @_pendingClicks[button]
    delete @_clickCount[button]
  
  press: (e) =>
    @enqueue 'press', e
    @logClickStart e.button
    @_buttonState[e.button] = true
    
  release: (e) =>
    @enqueue 'release', e
    @_buttonState[e.button] = false
    if @_pendingClicks[e.button] isnt undefined
      e.clickCount = @_clickCount[e.button]
      @enqueue 'click', e
    
  move: (e) =>
    if @_buttonState[e.button]
      # mouse movement invalidates any clicks
      for button of @_pendingClicks
        @clearClick button
      @enqueue 'drag', e
    else
      @enqueue 'move', e
    
  over: (e) =>
    @enqueue 'over', e
    unless @_entered
      @_entered = true
      @enqueue 'enter', e

  wheel: (e) =>
    @enqueue 'wheel', e

  exit: (e) =>
    @_entered = false
    # when mouse leaves canvas, stop 'dragging'
    # this may not sound right, but in practice, it's the expected
    # result far more often than the reverse.
    for button of @_buttonState
      delete @_buttonState[button]
    @enqueue 'exit', e
