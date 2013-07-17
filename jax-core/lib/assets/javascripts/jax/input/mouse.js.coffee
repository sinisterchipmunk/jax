class Jax.Input.Mouse extends Jax.Input
  @eventTypes:
    press:   'mousedown'
    release: 'mouseup'
    move:    'mousemove'
    over:    'mouseover'
    wheel:   'mousewheel, DOMMouseScroll'
    exit:    'mouseout'
    
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
  
  ###
  Programmatically triggers an event. Note that because Jax uses
  `addEventListener`, you can't trigger events using jQuery. Instead,
  you have to either trigger events through the DOM methods, or use this 
  method.
  ###
  trigger: (type, evt = {}) ->
    if type is 'click'
      @trigger 'mousedown', evt
      @trigger 'mouseup',   evt
      return
    event = document.createEvent 'MouseEvents'
    event.initMouseEvent type, true,               \ # type, bubbles, 
                         true,                     \ # cancelable,
                         window,                   \ # windowObject
                         1,                        \ # detail
                         evt.screenX, evt.screenY, \ # screenX, screenY
                         evt.clientX, evt.clientY, \ # clientX, clientY
                         false, false,             \ # ctrlKey, altKey
                         false, false,             \ # shiftKey, metaKey
                         evt.button, null            # button, relatedTarget
    @receiver.dispatchEvent event
    
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
    rect = @receiver.getBoundingClientRect()
    root = document.documentElement
    evt =
      base: evt
      button: evt.button
      x: evt.clientX - rect.left
      y: evt.clientY - rect.top
      wheelDeltaX: evt.wheelDeltaX || 0
      wheelDeltaY: evt.wheelDeltaY || -evt.detail
      wheelDeltaZ: evt.wheelDeltaZ || 0
      wheelDelta:  evt.wheelDelta  || 1
    evt.x *= @receiver.width / rect.width
    evt.y *= @receiver.height/ rect.height
    if @_lastx is undefined
      evt.diffx = evt.diffy = 0
    else
      [evt.diffx, evt.diffy] = [evt.x - @_lastx, evt.y - @_lasty]
    [@_lastx, @_lasty] = [evt.x, evt.y]
    evt
  
  update: (timechange) ->
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
  
  listen: (type, callback) ->
    switch type
      when 'enter'
        super 'over'
        super 'exit'
        @addEventListener 'enter', callback if callback
      when 'move', 'click'
        super 'move'
        super 'press'
        super 'release'
        @addEventListener type, callback if callback
      when 'drag'
        super 'move'
        super 'press'
        super 'release'
        super 'exit'
        @addEventListener type, callback if callback
      else super type, callback
      
  press: (e) ->
    @fireEvent 'press', e
    @logClickStart e.button
    @_buttonState[e.button] = true
    
  release: (e) ->
    @fireEvent 'release', e
    @_buttonState[e.button] = false
    if @_pendingClicks[e.button] isnt undefined
      e.clickCount = @_clickCount[e.button]
      @fireEvent 'click', e
    
  move: (e) ->
    if @_buttonState[e.button]
      # mouse movement invalidates any clicks
      for button of @_pendingClicks
        @clearClick button
      @fireEvent 'drag', e
    else
      @fireEvent 'move', e
    
  over: (e) ->
    @fireEvent 'over', e
    unless @_entered
      @_entered = true
      @fireEvent 'enter', e

  wheel: (e) ->
    @fireEvent 'wheel', e

  exit: (e) ->
    @_entered = false
    # when mouse leaves canvas, stop 'dragging'
    # this may not sound right, but in practice, it's the expected
    # result far more often than the reverse.
    for button of @_buttonState
      delete @_buttonState[button]
    @fireEvent 'exit', e
