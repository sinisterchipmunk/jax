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

  trigger: (type, evt = {}) ->
    event = document.createEvent 'MouseEvents'
    event.initMouseEvent type, true, true, window, 1, \ # type, bubbles, cancelable, windowObject, detail
                         evt.screenX, evt.screenY,    \ # screenX, screenY
                         evt.clientX, evt.clientY,    \ # clientX, clientY
                         false, false, false, false,  \ # ctrlKey, altKey, shiftKey, metaKey
                         evt.button, null               # button, relatedTarget
    @receiver.dispatchEvent event

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
      when 'move', 'click', 'drag'
        super 'move'
        super 'press'
        super 'release'
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
    @fireEvent 'exit', e
