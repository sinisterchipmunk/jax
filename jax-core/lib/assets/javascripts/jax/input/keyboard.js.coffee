class Jax.Input.Keyboard extends Jax.Input
  Jax.Input.devices.push this

  alias: 'keyboard'

  register: (controller) ->
    if controller.key_pressed
      @attach 'keydown',  (event) -> controller.key_pressed  event
    if controller.key_released
      @attach 'keyup',    (event) -> controller.key_released event
    if controller.key_typed
      @attach 'keypress', (event) -> controller.key_typed  event

  constructor: (element, options = {}) ->
    super element, options
    shouldFocus = false
    unless @receiver.attr('tabindex')
      shouldFocus = true
      @receiver.attr 'tabindex', '0'
    if options.focus is undefined or options.focus
      # make sure the element can accept key events
      if shouldFocus
        @receiver.focus()
    # add a mouse listener to capture focus when mouse moves over
    @receiver.on 'mouseover', @_captureFocus = (e) ->
      this.focus()
