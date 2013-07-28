# Methods which can be added to potential event emitters.
Jax.EventEmitter =

  # Returns an array containing all event listeners associated with the
  # specified event type.
  getEventListeners: (name) ->
    @_eventListeners or= {}
    @_eventListeners[name] or= []

  # Adds the specified callback to the list of event listeners to be called
  # when the given event type is fired.
  on: (name, callback) ->
    @getEventListeners(name).push(callback)
    callback

  # Removes the specified callback from the list of event listeners to be
  # called when the given event type is fired. If no callback is given, all
  # listeners are removed.
  #
  # If the event type is not given, all event listeners of all types will
  # be removed.
  off: (name, callback) ->
    if name
      listeners = @getEventListeners(name)
      if callback
        for listener, i in listeners
          return listeners.splice i, 1 if callback is listener
        true
      else
        listeners.splice 0, listeners.length
    else @_eventListeners = {}

  # Triggers an event. An optional event object can be specified, which will
  # be passed to each listener registered for the given event.
  trigger: (name, event) ->
    for listener in @getEventListeners(name)
      listener.call this, event
    true
