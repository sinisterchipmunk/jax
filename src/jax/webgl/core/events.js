Jax.Events = (function() {
  return {
    Methods: {
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || [];
      },
      
      addEventListener: function(name, callback) {
        this.getEventListeners(name).push(callback);
      },
      
      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        for (var i = 0; i < listeners.length; i++)
          listeners[i].call(this, event_object);
      }
    }
  };
})();
