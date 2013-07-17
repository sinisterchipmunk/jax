#= require_self
#= require_tree './input'

class Jax.Input
  @include Jax.EventEmitter
  
  constructor: (@receiver, @options = {}) ->
    @_listeners = {}
    @receiver.getEventListeners = (type) => @getReceiverEventListeners type
    
  getReceiverEventListeners: (type) -> @_listeners[type] or= []

  isListening: (type) -> !!@getReceiverEventListeners(type).length
  
  ###
  Subclasses can override this method if they need to maintain themselves
  over time. The default implementation does nothing. Timechange is in 
  seconds.
  ###
  update: (timechange) ->
    
  ###
  Manually triggers an event on the underlying receiver. This is mostly
  used for testing. Subclasses must override this method; the default
  implementation just raises an error.
  ###  
  trigger: (type, event) ->
    throw new Error "#{@__proto__.constructor.name} can't trigger event type #{type}: not implemented"
    
  ###
  Explicitly process a given event object. This is normally invoked by
  an event listener added to the underlying receiver.
  ###
  processEvent: (eventType, evt) ->
    for listener in @getReceiverEventListeners eventType
      listener.call(this, evt)
    true
      
  ###
  Convenience method that just registers the specified event listener with
  the input receiver. Ensures that the specific callback is only ever
  registered once.
  ###
  attach: (eventType, callback) ->
    listeners = @getReceiverEventListeners(eventType)
    unless listeners.interface
      listeners.interface = (evt) => 
        evt.preventDefault()
        @processEvent eventType, evt
      @receiver.addEventListener eventType, listeners.interface
    listeners.push callback unless callback in listeners
    
  ###
  Removes all event listeners from the input receiver.
  ###
  stopListening: ->
    for type of @_listeners
      listeners = @getReceiverEventListeners type
      if listeners.interface
        @receiver.removeEventListener type, listeners.interface
        listeners.length = 0
        delete listeners.interface
    @removeAllEventListeners()

  ###
  Starts listening for a specific event type. The callback is optional and
  if specified, will be fired every time this input device fires the specified
  event type.
  ###
  listen: (type, callback) ->
    if this[type]
      if domTypes = @__proto__.constructor.eventTypes?[type]
        for eventType in domTypes.split /,/
          @attach eventType.trim(), this[type]
          @addEventListener type, callback if callback
        true
      else
        throw new Error "BUG: Method `#{type}` exists but no corresponding DOM event type associated"
    else throw new Error "Invalid #{@__proto__.constructor.name} input type: #{type}"
    