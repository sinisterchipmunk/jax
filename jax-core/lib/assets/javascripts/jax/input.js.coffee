#= require_self
#= require_tree './input'

class Jax.Input
  @include Jax.EventEmitter

  @devices: []
  
  ###
  Takes a `@receiver`, which is expected to be an HTML element which will
  emit events, such as a `<canvas/>` element.
  ###
  constructor: (@receiver, @options = {}) ->
    @receiver = $ @receiver
    @_attached = {}
    @_pendingEvents = {}

  # isListening: (type) -> !!@getReceiverEventListeners(type).length

  ###
  Registers the given controller to receive input from this device.

  This method must be overridden by subclasses.
  ###
  register: (controller) ->
    throw new Error "Input device must register listeners"

  ###
  Subclasses can override this method if they need to preprocess the event
  object prior to dispatching it to any listeners. They should return the
  event object, or a new object if it is intended to replace the original.
  ###
  processEvent: (type, event) -> event
  
  ###
  Subclasses can override this method if they need to maintain themselves
  over time. The default implementation does nothing. Timechange is in 
  seconds.
  ###
  update: (timechange) ->
    for type, event of @_pendingEvents
      @trigger type, event
      delete @_pendingEvents[type]
    true

  ###
  Adds an event to the pending events queue, to be dispatched the next time
  `update` is called. Note that any event of the same type already in the
  queue will be replaced. This ensures multiple events are not dispatched
  between updates, wasting cycles.
  ###
  enqueue: (type, event) ->
    @_lastEnqueuedEventType = type
    @_pendingEvents[type] = event

  ###
  If the specified event type is in the events queue waiting to be dispatched,
  it is returned. Otherwise, `undefined` is returned.
  ###
  enqueued: (type) -> @_pendingEvents[type]

  ###
  Returns the last enqueued event type.
  ###
  getLastEnqueuedEventType: -> @_lastEnqueuedEventType

  ###
  Returns the last enqueued event, or `null` if no events have been enqueued
  since the last call to `update`.
  ###
  getLastEnqueuedEvent: -> @enqueued @getLastEnqueuedEventType()
    
  ###
  Attaches the specified event listener to the `@receiver`. Ensures that
  the specific callback is only ever registered once.
  ###
  attach: (eventType, callback) ->
    attached = @_attached[eventType] or= []
    for attachedCallback in attached
      return if callback is attachedCallback
    attached.push callback
    @receiver.on eventType, (event) =>
      callback @processEvent eventType, event
    
  ###
  Removes all event listeners from the input receiver.
  ###
  stopListening: ->
    @off()
    @receiver.off()
