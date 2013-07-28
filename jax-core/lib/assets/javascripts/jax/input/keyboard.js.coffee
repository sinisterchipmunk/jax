class Jax.Input.Keyboard extends Jax.Input
  Jax.Input.devices.push this

  alias: 'keyboard'

  register: (controller) ->
    if controller.key_pressed
      @attach 'keydown', @press
      @on 'press',   (event) -> controller.key_pressed  event
    if controller.key_released
      @attach 'keyup', @release
      @on 'release', (event) -> controller.key_released event
    if controller.key_typed
      @attach 'keypress', @type
      @on 'type',    (event) -> controller.key_typed    event

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

  press: (e) =>
    @enqueue 'press', e
    
  release: (e) =>
    @enqueue 'release', e
    
  type: (e) =>
    @enqueue 'type', e
