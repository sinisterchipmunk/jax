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
    },
    
    toEqualVector: function() {
      var vec;
      switch(arguments.length) {
        case 1: vec = vec3.create(arguments[0]); break;
        case 3: vec = vec3.create(arguments); break;
        default: throw new Error("Invalid args");
      }
      if (this.actual.length != vec.length) return false;
      for (var i = 0; i < this.actual.length; i++)
        if (this.actual[i] != vec[i]) return false;
      return true;
    },
    
    toEqualMatrix: function(mat) {
      if (this.actual.length != mat.length) return false;
      for (var i = 0; i < this.actual.length; i++)
        if (this.actual[i] != mat[i]) return false;
      return true;
    },
    
    toHaveFace: function(v1, v2, v3) {
      var actual = this.actual;
      this.actual = {faces: actual.faces, vertices: actual.getVertexBuffer().js};
      for (var i = 0; i < actual.faces.length; i++) {
        var f = actual.getFaceVertices(actual.faces[i]);
        
        var match = true;
        for (var j = 0; j < 3; j++) {
          for (var k = 0; k < 3; k++) {
            if (f[j][k] != arguments[j][k])
              match = false;
          }
        }
        if (match) return true;
      }
      return false;
    },
    
    toHaveEdge: function(v1, v2) {
      var actual = this.actual;
      this.actual = actual.edges;
      for (var i = 0; i < actual.edges.length; i++) {
        var e = actual.getEdgeVertices(actual.edges[i]);
        var match = true;
        for (var j = 0; j < 2; j++) {
          for (var k = 0; k < 3; k++) {
            if (e[j][k] != arguments[j][k])
              match = false;
          }
        }
        if (match) return true;
      }
      return false;
    }
  });
});
