/**
 * mixin Jax.EventEmitter
 * 
 * Methods which can be added to potential event emitters.
 **/
Jax.EventEmitter = {
  /**
   * Jax.EventEmitter#getEventListeners(type) -> Array
   * - type (String): the type of event to retrieve listeners for.
   *
   * Returns an array containing all event listeners associated with the specified
   * event type.
   **/
  getEventListeners: function(name) {
    this.event_listeners || (this.event_listeners = {});
    return this.event_listeners[name] || (this.event_listeners[name] = []);
  },
  
  /**
   * Jax.EventEmitter#addEventListener(type, callback) -> Number
   * - type (String): the type of event to listen for.
   * - callback (Function): the callback function to receive the event
   *
   * Adds the specified callback to the list of event listeners to be called
   * when the given event type is fired.
   *
   * Returns the listener itself.
   **/
  addEventListener: function(name, callback) {
    var ary = this.getEventListeners(name);
    ary.push(callback);
    return callback;
  },
  
  /**
   * Jax.EventEmitter#removeEventListener(type, index) -> Function | undefined
   * - type (String): the type of event to remove the listener from.
   * - index (Number): the numeric index of the callback to be removed.
   *
   * Removes the callback represented by the index (as returned by
   * Jax.EventEmitter#addEventListener) from the event listener of
   * the specified type. Other event types are unaffected, even if they
   * contain the exact same callback function.
   *
   * Returns the original callback function, or undefined if it was not found.
   **/
  removeEventListener: function(name, index) {
    if (!name || index == undefined) throw new Error("both event type and listener index are required");
    var ary = this.getEventListeners(name);
    if (index instanceof Function) {
      var i = ary.indexOf(index);
      if (i != -1)
        ary.splice(i, 1);
      return index;
    } else {
      var result = ary[index];
      ary.splice(index, 1);
      return result;
    }
  },

  removeAllEventListeners: function() {
    var listeners = this.event_listeners;
    if (listeners) {
      for (var name in listeners) {
        var ary = listeners[name];
        ary.splice(0, ary.length);
      }
    }
  },
  
  /**
   * Jax.EventEmitter#fireEvent(type[, event]) -> undefined
   * - type (String): the type of event to fire
   * - event (Object): an optional object to be passed as an argument
   * to the event listeners.
   *
   * Fires an event. All listeners monitoring the specified event type
   * will receive the event object as an argument. If specified, the
   * event object's +type+ property is automatically assigned to the
   * specified type unless the object already has a +type+ property.
   * Examples:
   *
   *     this.addEventListener('loaded', function(obj) { alert(obj.type); });
   *     this.fireEvent('loaded', { });
   *     // "loaded"
   *
   *     this.addEventListener('loaded', function(obj) { alert(obj.type); });
   *     this.fireEvent('loaded', {type:'none'});
   *     // "none"
   *
   **/
  fireEvent: function(name, event_object) {
    var listeners = this.getEventListeners(name);
    if (event_object && event_object.type === undefined)
      event_object.type = name;
    for (var i in listeners)
      listeners[i].call(this, event_object);
  },

  /* aliases that will soon deprecate the older names */
  on: function(name, callback) {
    return this.addEventListener(name, callback);
  },

  trigger: function(name, event) {
    return this.fireEvent(name, event);
  }
};
