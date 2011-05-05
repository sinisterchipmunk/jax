Jax.Events = (function() {
  return {
    Methods: {
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || [];
      },
      
      addEventListener: function(name, callback) {
        this.getEventListeners(name).push(callback);
        return this.getEventListeners(name).length - 1;
      },
      
      removeEventListener: function(name, index) {
        this.getEventListeners(name).splice(index, 1);
      },
      
      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        for (var i = 0; i < listeners.length; i++)
          listeners[i].call(this, event_object);
      }
    }
  };
})();
