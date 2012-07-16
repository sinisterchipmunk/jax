class Jax.Input.Mouse extends Jax.Input
  @eventTypes:
    press:   'mousedown'
    release: 'mouseup'
    move:    'mousemove'
    over:    'mouseover'
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
    
  cumOffset = [0, 0]
  
  ###
  Returns the cumulative offset, in pixels, of the @receiver, from the
  top left of the page, in the form of an array of [left, top]. The array
  is reused every time this method is called, so it should not be cached.
  ###
  getCumulativeOffset: ->
    [x, y] = [0, 0]
    ele = @receiver
    while ele
      x += (ele.offsetLeft || 0) + 1
      y += (ele.offsetTop  || 0) + 1
      ele = ele.offsetParent
    cumOffset[0] = x
    cumOffset[1] = y
    return cumOffset

  trigger: (type, evt = {}) ->
    event = document.createEvent 'MouseEvents'
    event.initMouseEvent type, true, true, window, 1, \ # type, bubbles, cancelable, windowObject, detail
                         evt.screenX, evt.screenY,    \ # screenX, screenY
                         evt.clientX, evt.clientY,    \ # clientX, clientY
                         false, false, false, false,  \ # ctrlKey, altKey, shiftKey, metaKey
                         evt.button, null               # button, relatedTarget
    @receiver.dispatchEvent event
    
  processEvent: (type, evt) ->
    @normalizeEvent evt
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
    # Calculate pageX/Y if missing and clientX/Y available
    if evt.pageX is undefined and evt.clientX isnt null
      eventDocument = evt.target.ownerDocument || document
      doc = eventDocument.documentElement
      body = eventDocument.body
      evt.pageX = evt.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
      evt.pageY = evt.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0)
      
    buf = @getCumulativeOffset()
    [evt.x, evt.y] = [evt.pageX - buf[0], evt.pageY - buf[1]]
    if @receiver.width || @receiver.height
      evt.x *= @receiver.width  / @receiver.clientWidth
      evt.y *= @receiver.height / @receiver.clientHeight
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
    
  exit: (e) ->
    @_entered = false
    # when mouse leaves canvas, stop 'dragging'
    # this may not sound right, but in practice, it's the expected
    # result far more often than the reverse.
    for button of @_buttonState
      delete @_buttonState[button]
    @fireEvent 'exit', e
