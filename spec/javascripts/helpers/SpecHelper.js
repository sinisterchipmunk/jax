beforeEach(function() {
  function testUsesShader(spec, shader_name, world) {
    if (!world)
      throw new Error("Specify a Jax.World to test against");

    /*
      render could execute for any number of passes, so we must accumulate the result.
      Test passes if any shader matches. Also, we make a call to the original render func
      so that if there are any logical errors, they will be encountered here.
    */
    var matched = false, oldMaterialFunc;
    var materialFunc = function(context, mesh, options) {
      if (shader_name.test) matched = matched || shader_name.test(options.shader);
      else matched = matched || options.shader == shader_name;
      oldMaterialFunc.call(this, context, mesh, options);
    };
    var tempMesh = false;
    if (spec.actual) {
      if (!spec.actual.mesh) { tempMesh = true; spec.actual.mesh = new Jax.Mesh.Quad(); }
      if (!spec.actual.mesh.material || typeof(spec.actual.mesh.material) == 'string')
        spec.actual.mesh.material = Jax.Material.find(spec.actual.mesh.material || spec.actual.mesh.default_material);
      
      oldMaterialFunc = spec.actual.mesh.material.render;
      spec.actual.mesh.material.render = materialFunc;
    }
      
    world.render();
    
    // clean up
    if (tempMesh) delete spec.actual.mesh;
    else spec.actual.mesh.material.render = oldMaterialFunc;
      
    spec.actual = "model";
    return matched;
  }
  
  function testDefaultsToShader(spec, shader_name, world) {
    if (!world)
      throw new Error("Specify a Jax.World to test against");

    var matched = false, oldMeshFunc;
    var meshFunc = function(context, options) {
      options = this.getNormalizedRenderOptions(options);
      if (shader_name.test) matched = matched || shader_name.test(options.default_shader);
      else matched = matched || options.default_shader == shader_name;
      oldMeshFunc.call(this, context, options);
    };
    var tempMesh = false;
    if (spec.actual) {
      if (!spec.actual.mesh) { tempMesh = true; spec.actual.mesh = new Jax.Mesh.Quad(); }
      oldMeshFunc = spec.actual.mesh.render;
      spec.actual.mesh.render = meshFunc;
    }
      
    world.render();
    
    // clean up
    if (tempMesh) delete spec.actual.mesh;
    else spec.actual.mesh.render = oldMeshFunc;
      
    spec.actual = "model";
    return matched;
  }

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
    },
    
    toUseShader: function(name, world) {
      return testUsesShader(this, name, world);
    },
    
    toCastShadow: function(world) {
      /*
        the only BDD way I can think of to whether the model's shadow is actually *rendered*, is to verify that it is
        rendered with a depth map. Certainly, a depth map could mean anything. So, there's no way to be 100% certain
        without visually checking the result. But this is at least a line of defense. Must be wary of false positives,
        however, where a depth map is used for something other than a shadow. I don't know how to address this last
        case, so far -- but this is at least better than not testing at all.
       */
      
      return testUsesShader(this, 'depthmap', world);
    },
    
    toDefaultToShader: function(name, world) {
      return testDefaultsToShader(this, name, world);
    }
  });
});
