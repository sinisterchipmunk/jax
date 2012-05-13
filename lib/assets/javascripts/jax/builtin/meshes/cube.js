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
  var _descriptor = { position: vec3.create() };
  
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
      var rebuild = function() { self.rebuild(); };
      var invalidate = function() { rebuild(); };
      var w = options.width, h = options.height, d = options.depth;
      this.left = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
      this.left.camera.reorient([-1,0,0], [-w/2,0,0]);
      this.left.mesh.addEventListener("color_changed", invalidate);
      this.left.camera.addEventListener("updated", rebuild);
      Object.defineProperty(this.left, 'color', {
        get: function() { return self.left.mesh.color; },
        set: function(c) { self.left.mesh.color = c; }
      });

      this.right = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
      this.right.camera.reorient([1,0,0], [w/2,0,0]);
      this.right.mesh.addEventListener("color_changed", invalidate);
      this.right.camera.addEventListener("updated", rebuild);
      Object.defineProperty(this.right, 'color', {
        get: function() { return self.right.mesh.color; },
        set: function(c) { return self.right.mesh.color = c; }
      });

      this.front = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
      this.front.camera.reorient([0,0,1], [0,0,d/2]);
      this.front.mesh.addEventListener("color_changed", invalidate);
      this.front.camera.addEventListener("updated", rebuild);
      Object.defineProperty(this.front, 'color', {
        get: function() { return self.front.mesh.color; },
        set: function(c) { return self.front.mesh.color = c; }
      });

      this.back = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
      this.back.camera.reorient([0,0,-1], [0,0,-d/2]);
      this.back.mesh.addEventListener("color_changed", invalidate);
      this.back.camera.addEventListener("updated", rebuild);
      Object.defineProperty(this.back, 'color', {
        get: function() { return self.back.mesh.color; },
        set: function(c) { return self.back.mesh.color = c; }
      });

      this.top = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
      this.top.camera.reorient([0,1,0], [0,h/2,0]);
      this.top.mesh.addEventListener("color_changed", invalidate);
      this.top.camera.addEventListener("updated", rebuild);
      Object.defineProperty(this.top, 'color', {
        get: function() { return self.top.mesh.color; },
        set: function(c) { return self.top.mesh.color = c; }
      });

      this.bottom = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
      this.bottom.camera.reorient([0,-1,0], [0,-h/2,0]);
      this.bottom.mesh.addEventListener("color_changed", invalidate);
      this.bottom.camera.addEventListener("updated", rebuild);
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
        var side = this[SIDES[i]];
        var sverts = side.mesh.vertices;
        var matrix = side.camera.getTransformationMatrix();
        for (var j = 0; j < sverts.length; j++) {
          var svert = sverts[j];
          mat4.multiplyVec3(matrix, svert.position, _descriptor.position);
          for (var k = 0; k < 4; k++) {
            if (k < 2) texes.push(svert.texture[k]);
            if (k < 3) {
              verts.push(_descriptor.position[k]);
              norms.push(svert.normal[k]);
            }
            colors.push(svert.color[k]);
          }
          // _descriptor.color = svert.blended_color;
          // _descriptor.normal = svert.normal;
          // _descriptor.texture = svert.texture;
          // this.add_vertex(_descriptor);
        }
      }
    }
  });
})();
