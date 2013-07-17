class Jax.Input.Keyboard extends Jax.Input
  @eventTypes:
    press:   'keydown'
    release: 'keyup'
    type:    'keypress'
    
  constructor: (element, options = {}) ->
    super element, options
    shouldFocus = false
    unless @receiver.getAttribute('tabindex')
      shouldFocus = true
      @receiver.setAttribute 'tabindex', '0'
    if options.focus is undefined or options.focus
      # make sure the element can accept key events
      if shouldFocus
        @receiver.focus()
    # add a mouse listener to capture focus when mouse moves over
    @receiver.addEventListener 'mouseover', @_captureFocus = (e) ->
      this.focus()

  trigger: (type, evt = {}) ->
    event = document.createEvent 'KeyboardEvent'
    if event.initKeyboardEvent
      event.initKeyboardEvent type, true, true, null,             \ # type, bubbles, cancelable, viewArg
                              evt.ctrl, evt.alt, evt.shift,       \ # ctrl, alt, shift
                              evt.meta, evt.keyCode, evt.charCode   # meta, keyCode, charCode
    else
      event.initKeyEvent type, true, true, null,             \ # type, bubbles, cancelable, viewArg
                         evt.ctrl, evt.alt, evt.shift,       \ # ctrl, alt, shift
                         evt.meta, evt.keyCode, evt.charCode   # meta, keyCode, charCode
    @receiver.dispatchEvent event
    
  stopListening: ->
    @receiver.removeEventListener 'mouseover', @_captureFocus
    super()

  press: (e) ->
    @fireEvent 'press', e
    
  release: (e) ->
    @fireEvent 'release', e
    
  type: (e) ->
    @fireEvent 'type', e
