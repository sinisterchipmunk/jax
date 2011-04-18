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
      return this.actual == true;
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
      var vec = vec3.create();
      switch(arguments.length) {
        case 1: vec = arguments[0]; break;
        case 3: vec3.set(arguments, vec); break;
        default: throw new Error("Invalid args");
      }
      if (this.actual.length != vec.length) return false;
      for (var i = 0; i < this.actual.length; i++)
        if (Math.abs(this.actual[i] - vec[i]) > Math.EPSILON) return false;
      return true;
    },
    
    toEqualMatrix: function(mat) {
      if (this.actual.length != mat.length) return false;
      for (var i = 0; i < this.actual.length; i++)
        if (Math.abs(this.actual[i] - mat[i]) > Math.EPSILON) return false;
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
            if (Math.abs(f[j][k] - arguments[j][k]) > Math.EPSILON)
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
            if (Math.abs(e[j][k] - arguments[j][k]) > Math.EPSILON)
              match = false;
          }
        }
        if (match) return true;
      }
      return false;
    },
    
    toBeIlluminated: function() {
      var model = this.actual;
      this.actual = "model";
      var original_render = model.render;
      
      var context = new Jax.Context('canvas-element');
      context.world.addObject(model);
      context.world.addLightSource(new Jax.Scene.LightSource({type:Jax.DIRECTIONAL_LIGHT}));

      var illuminated = false;
      model.render = function() {
        if (context.current_pass == Jax.Scene.ILLUMINATION_PASS)
          illuminated = true;
      };

      spyOn(model, 'render').andCallThrough();
      context.world.render();
      
      var called = model.render.callCount;
      if (!model.render.callCount) result = false; // fail-safe
      context.dispose();
      
      model.render = original_render;
      return called && illuminated;
    },
    
    toBeRendered: function() {
      var context = new Jax.Context('canvas-element');
      var model = this.actual;
      var original_render = model.render;
      context.world.addObject(model);
      
      this.actual = 'model';
      spyOn(model, 'render');
      context.world.render();
      expect(model.render).toHaveBeenCalled();
      
      context.dispose();
      model.render = original_render;
    }
  });
});
