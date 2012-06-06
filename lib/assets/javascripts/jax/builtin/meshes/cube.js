/**
 * class Jax.Mesh.Cube < Jax.Mesh
 *
 * Constructs a 6-sided Cube mesh.
 *
 * Options:
 *
 * * width : the width of the cube in units. Defaults to +size+.
 * * height : the height of the cube in units. Defaults to +size+.
 * * depth : the depth of the cube in units. Defaults to +size+.
 * * size : a value to use for any of the other options if
 * they are unspecified. Defaults to 1.0.
 *
 * Example:
 *
 *     new Jax.Mesh.Cube();                  //=> 1x1x1
 *     new Jax.Mesh.Cube({size:2});          //=> 2x2x2
 *     new Jax.Mesh.Cube({width:2});         //=> 2x1x1
 *     new Jax.Mesh.Cube({width:2,depth:3}); //=> 2x1x3
 *
 **/
Jax.Mesh.Cube = (function() {
  
  var SIDES = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  var _tmpvec3 = vec3.create();
  
  return Jax.Class.create(Jax.Mesh.Triangles, {
    initialize: function($super, options) {
      if (!options) options = {};
      var size = options.size = options.size || 1.0;
      options.width = options.width || options.size;
      options.depth = options.depth || options.size;
      options.height = options.height || options.size;
      $super(options);
    
      var self = this;
      /* TODO for performance, only update data that has actually changed */
      var invalidate = function() { self.invalidate(); };
      var w = options.width, h = options.height, d = options.depth;
      this.left = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
      this.left.camera.reorient([-1,0,0], [-w/2,0,0]);
      this.left.mesh.addEventListener("colorChanged", invalidate);
      this.left.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.left, 'color', {
        get: function() { return self.left.mesh.color; },
        set: function(c) { self.left.mesh.color = c; }
      });

      this.right = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
      this.right.camera.reorient([1,0,0], [w/2,0,0]);
      this.right.mesh.addEventListener("colorChanged", invalidate);
      this.right.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.right, 'color', {
        get: function() { return self.right.mesh.color; },
        set: function(c) { return self.right.mesh.color = c; }
      });

      this.front = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
      this.front.camera.reorient([0,0,1], [0,0,d/2]);
      this.front.mesh.addEventListener("colorChanged", invalidate);
      this.front.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.front, 'color', {
        get: function() { return self.front.mesh.color; },
        set: function(c) { return self.front.mesh.color = c; }
      });

      this.back = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
      this.back.camera.reorient([0,0,-1], [0,0,-d/2]);
      this.back.mesh.addEventListener("colorChanged", invalidate);
      this.back.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.back, 'color', {
        get: function() { return self.back.mesh.color; },
        set: function(c) { return self.back.mesh.color = c; }
      });

      this.top = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
      this.top.camera.reorient([0,1,0], [0,h/2,0]);
      this.top.mesh.addEventListener("colorChanged", invalidate);
      this.top.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.top, 'color', {
        get: function() { return self.top.mesh.color; },
        set: function(c) { return self.top.mesh.color = c; }
      });

      this.bottom = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
      this.bottom.camera.reorient([0,-1,0], [0,-h/2,0]);
      this.bottom.mesh.addEventListener("colorChanged", invalidate);
      this.bottom.camera.addEventListener("updated", invalidate);
      Object.defineProperty(this.bottom, 'color', {
        get: function() { return self.bottom.mesh.color; },
        set: function(c) { return self.bottom.mesh.color = c; }
      });
    },
  
    init: function(verts, colors, texes, norms) {
      // we need to get each quad's vertices, but then transform them by the object's
      // local transformation, which includes the position offset and direction.
    
      var matrix;
      for (var i = 0; i < SIDES.length; i++)
      {
        var side = this[SIDES[i]], sdata = side.mesh.data;
        // use inverse transform to go from world space to object space, instead of the
        // opposite.
        var mvmatrix = side.camera.getTransformationMatrix(),
            nmatrix = side.camera.getNormalMatrix();
        for (var j = 0; j < sdata.length; j++) {
          var vofs = j * 3, tofs = j * 2, cofs = j * 4;
          
          _tmpvec3[0] = sdata.vertexBuffer[vofs];
          _tmpvec3[1] = sdata.vertexBuffer[vofs+1];
          _tmpvec3[2] = sdata.vertexBuffer[vofs+2];
          mat4.multiplyVec3(mvmatrix, _tmpvec3, _tmpvec3);
          verts.push(_tmpvec3[0], _tmpvec3[1], _tmpvec3[2]);
          
          _tmpvec3[0] = sdata.normalBuffer[vofs];
          _tmpvec3[1] = sdata.normalBuffer[vofs+1];
          _tmpvec3[2] = sdata.normalBuffer[vofs+2];
          mat3.multiplyVec3(nmatrix, _tmpvec3, _tmpvec3);
          norms.push(_tmpvec3[0], _tmpvec3[1], _tmpvec3[2]);
          
          colors.push(sdata.colorBuffer[cofs], sdata.colorBuffer[cofs+1], sdata.colorBuffer[cofs+2], sdata.colorBuffer[cofs+3]);
          texes.push(sdata.textureCoordsBuffer[tofs], sdata.textureCoordsBuffer[tofs+1]);
        }
      }
    }
  });
})();
