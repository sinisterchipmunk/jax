beforeEach(function() {
  this.addMatchers({
    toBeCounterClockwise: function(xform) {
      return !this.actual.isClockwise(xform);
    },

    toBeClockwise: function(xform) {
      return  this.actual.isClockwise(xform);
    },

    toBeNaN: function() {
      return isNaN(this.actual);
    },
    
    toHaveBeenCalledWithIsh: function(ish) {
      for (var i = 0; i < this.actual.calls.length; i++)
        if (Math.equalish(this.actual.calls[i].args, ish))
          return true;
      return false;
    },
    
    toBeDisposed: function() {
      return this.actual.isDisposed();
    },
    
    toBeRendering: function() {
      return this.actual.isRendering();
    },
    
    toBeUpdating: function() {
      return this.actual.isUpdating();
    },
    
    toBeValid: function() {
      return this.actual.isValid();
    },
    
    toInclude: function(obj) {
      return this.actual.indexOf(obj) != -1;
    },
    
    toIncludeSubset: function(subset) {
      for (var i = 0; i < this.actual.length; i++) {
        var found = true;
        for (var j = 0; j < subset.length; j++)
          if (this.actual[i+j] != subset[j])
            found = false;
        if (found) return true;
      }
      
      return false;
    },
    
    toIncludishSubset: function(subset) {
      if (!this.actual.length)
        throw new Error("Use #toIncludishSubset with arrays and vectors, not scalars");
      for (var i = 0; i < this.actual.length; i++) {
        var found = true;
        for (var j = 0; j < subset.length; j++)
          if (!Math.equalish(this.actual[i+j], subset[j]))
            found = false;
        if (found) return true;
      }
      
      return false;
    },
    
    toBeBlank: function() {
      return this.actual.toString().length == 0
    },
    
    toBeKindOf: function(expectedKlass) {
      throw new Error("#toBeKindOf() is deprecated; please use #toBeInstanceOf() instead.");
    },
    
    toBeInstanceOf: function(expectedKlass) {
      return this.actual instanceof expectedKlass;
    },
    
    toBeTrue: function() {
      return this.actual === true;
    },
    
    toBeFalse: function() {
      return this.actual === false;
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
        case 3: vec3.copy(vec, arguments); break;
        default: throw new Error("Invalid args");
      }
      return Math.equalish(this.actual, vec);
    },
    
    toEqualMatrix: function(mat) {
      return Math.equalish(this.actual, mat);
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
    
    toBeEmpty: function() {
      if (typeof(this.actual.length) != "number") throw new Error("Expected "+jasmine.pp(this.actual)+" to have a length"); 
      return this.actual.length == 0;
    },
    
    toBeRendered: function() {
      var model = this.actual;
      var original_render = model.render;
      SPEC_CONTEXT.world.addObject(model);
      
      this.actual = 'model';
      spyOn(model, 'render');
      SPEC_CONTEXT.world.render();
      expect(model.render).toHaveBeenCalled();
      
      model.render = original_render;
    },
    
    toDefaultToMaterial: function(name, world) {
      var matr;
      if (name instanceof Jax.Material) matr = name;
      else matr = Jax.Material.find(name);
      spyOn(matr, 'render');
      world.render();
      expect(matr.render).toHaveBeenCalled();
      return true;
    }
  });
});
