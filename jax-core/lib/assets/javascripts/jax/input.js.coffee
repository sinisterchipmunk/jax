#= require 'jax/mixins/event_emitter'
#= require_self
#= require_tree './input'

class Jax.Input
  @include Jax.Mixins.EventEmitter

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
  over time. They need to be sure to call `super`, in order to dispatch events
  that have been enqueued since the last frame. Timechange is in seconds.
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
  Returns the last enqueued event, or `undefined` if no events have been
  enqueued since the last call to `update`.
  ###
  getLastEnqueuedEvent: -> @enqueued @getLastEnqueuedEventType()
    
  ###
  Begins listening for the specified DOM event type to be emitted from the
  `@receiver`. If the given callback is already registered, it will not be
  registered a second time. Thus, the main difference between this method
  and just simply adding event listeners directly to `@receiver`, is that
  this method will not produce duplicate events if the same listener is
  given more than once.
  ###
  attach: (eventType, callback) ->
    attached = @_attached[eventType] or= []
    for attachedCallback in attached
      return if callback is attachedCallback
    attached.push callback
    @receiver.on eventType, (event) =>
      callback @processEvent eventType, event
    
  ###
  Removes all event listeners from the input receiver, and removes all event
  listeners from this input device, effectively shutting it down until
  `register` is called again. This is used by `Jax.Context` as a teardown
  method while redirecting, in order to prevent memory leaks and clean up
  listeners for events that are no longer desired.
  ###
  stopListening: ->
    @off()
    @receiver.off()
    @_pendingEvents = {}
