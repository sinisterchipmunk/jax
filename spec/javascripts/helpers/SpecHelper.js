beforeEach(function() {
  this.addMatchers({
    toBePlaying: function(expectedSong) {
      var player = this.actual;
      return player.currentlyPlayingSong === expectedSong
          && player.isPlaying;
    },
    
    toBeKindOf: function(expectedKlass) {
      var instance = this.actual;
      return instance.isKindOf(expectedKlass);
    },
    
    toBeTrue: function() {
      return !!this.actual;
    },
    
    toBeUndefined: function() {
      return typeof(this.actual) == "undefined";
    },
    
    toBeAFunction: function() {
      return typeof(this.actual) == "function";
    },

    toBeAMethod: function() {
      return typeof(this.actual) == "function";
    },

    toHaveFunction: function(name) {
      return typeof(this.actual[name]) == "function";
    },

    toHaveMethod: function(name) {
      return typeof(this.actual[name]) == "function";
    }
  });
});
