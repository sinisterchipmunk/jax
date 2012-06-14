/**
 * Jax.Events
 * 
 * Generic event listener functionality which is added to a number of Jax objects
 * by default.
 **/
Jax.Events = (function() {
  return {
    /**
     * mixin Jax.Events.Methods
     *
     * Methods which can be added to potential event emitters.
     **/
    Methods: {
      /**
       * Jax.Events.Methods#getEventListeners(type) -> Array
       * - type (String): the type of event to retrieve listeners for.
       *
       * Returns an array containing all event listeners associated with the specified
       * event type.
       **/
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || {length:0};
      },
      
      /**
       * Jax.Events.Methods#addEventListener(type, callback) -> Number
       * - type (String): the type of event to listen for.
       * - callback (Function): the callback function to receive the event
       *
       * Adds the specified callback to the list of event listeners to be called
       * when the given event type is fired.
       *
       * Returns the numeric array index of the listener to be added.
       **/
      addEventListener: function(name, callback) {
        var ary = this.getEventListeners(name);
        var index = ary.length++;
        ary[index] = callback;
        return index;
      },
      
      /**
       * Jax.Events.Methods#removeEventListener(type, index) -> Function | undefined
       * - type (String): the type of event to remove the listener from.
       * - index (Number): the numeric index of the callback to be removed.
       *
       * Removes the callback represented by the index (as returned by
       * Jax.Events.Methods#addEventListener) from the event listener of
       * the specified type. Other event types are unaffected, even if they
       * contain the exact same callback function.
       *
       * Returns the original callback function, or undefined if it was not found.
       **/
      removeEventListener: function(name, index) {
        if (!name || index == undefined) throw new Error("both event type and listener index are required");
        var ary = this.getEventListeners(name);
        if (index instanceof Function) {
          for (var i = 0; i < ary.length; i++) {
            if (ary[i] === index)
              return this.removeEventListener(name, i);
          }
        } else {
          var func = ary[index];
          if (ary[index]) delete ary[index];
        }
        return func;
      },
      
      /**
       * Jax.Events.Methods#fireEvent(type[, event]) -> undefined
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
       * Note that the callback is fired using +call+, so the +this+ object
       * within a callback will represent the object that fired the event.
       *
       **/
      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        if (event_object && event_object.type == undefined)
          event_object.type = name;
        for (var i in listeners)
          if (i == 'length') continue;
          else listeners[i].call(this, event_object);
      }
    }
  };
})();
