class Jax.Input.Keyboard extends Jax.Input
  @eventTypes:
    press:   'keydown'
    release: 'keyup'
    type:    'keypress'
    
  constructor: (element) ->
    super element
    # make sure the element can accept key events
    if @receiver.getAttribute('tabindex') is null
      @receiver.setAttribute 'tabindex', '0'
      @receiver.focus()
    # add a mouse listener to capture focus when mouse moves over
    @receiver.addEventListener 'mouseover', @_captureFocus = (e) -> this.focus()

  trigger: (type, evt = {}) ->
    event = document.createEvent 'KeyboardEvent'
    event.initKeyboardEvent type, true, true, null,             \ # type, bubbles, cancelable, viewArg
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
