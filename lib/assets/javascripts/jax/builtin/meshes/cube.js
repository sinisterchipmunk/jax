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
Jax.Mesh.Cube = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    var size = options && options.size || 1.0;
    options = Jax.Util.normalizeOptions(options, {
      width: size,
      depth: size,
      height: size
    });
    this.draw_mode = GL_TRIANGLES;
    $super(options);
    
    var self = this;
    /* TODO for performance, only update data that has actually changed */
    var dispose = function() { self.dispose(); };
    var refresh = function() { self.dispose(); };
    var w = options.width, h = options.height, d = options.depth;
    this.left = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.left.camera.reorient([-1,0,0], [-w/2,0,0]);
    this.left.mesh.addEventListener("color_changed", dispose);
    this.left.camera.addEventListener("updated", refresh);

    this.right = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.right.camera.reorient([1,0,0], [w/2,0,0]);
    this.right.mesh.addEventListener("color_changed", dispose);
    this.right.camera.addEventListener("updated", refresh);

    this.front = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.front.camera.reorient([0,0,1], [0,0,d/2]);
    this.front.mesh.addEventListener("color_changed", dispose);
    this.front.camera.addEventListener("updated", refresh);

    this.back = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.back.camera.reorient([0,0,-1], [0,0,-d/2]);
    this.back.mesh.addEventListener("color_changed", dispose);
    this.back.camera.addEventListener("updated", refresh);

    this.top = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.top.camera.reorient([0,1,0], [0,h/2,0]);
    this.top.mesh.addEventListener("color_changed", dispose);
    this.top.camera.addEventListener("updated", refresh);

    this.bottom = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.bottom.camera.reorient([0,-1,0], [0,-h/2,0]);
    this.bottom.mesh.addEventListener("color_changed", dispose);
    this.bottom.camera.addEventListener("updated", refresh);
  },
  
  init: function(verts, colors, texes, norms) {
    // we need to get each quad's vertices, but then transform them by the object's
    // local transformation, which includes the position offset and direction.
    
    var matrix;
    var sides = ['left', 'right', 'top', 'bottom', 'front', 'back'];
    for (var i = 0; i < sides.length; i++)
    {
      var qverts = [], qcolor = [], qtex = [], qnorm = [];
      this[sides[i]].mesh.init(qverts, qcolor, qtex, qnorm, []);
      qcolor = this[sides[i]].mesh.getColorBuffer().js;
      matrix = this[sides[i]].camera.getTransformationMatrix();

      // unfortunately quads are rendered in triangle strips; we need to translate that
      // into triangles, because there's no support at this time for ending one triangle
      // strip and beginning another.
      function push(verti) {
        var i1 = verti*3, i2 = verti*3+1, i3 = verti*3+2;
        var vert = mat4.multiplyVec3(matrix, [qverts[i1], qverts[i2], qverts[i3]]);
        var norm = mat4.multiplyVec3(matrix, [qnorm[i1], qnorm[i2], qnorm[i3]]);
        
        verts.push(vert[0], vert[1], vert[2]);
        norms.push(norm[0], norm[1], norm[2]);
        if (qcolor.length != 0) colors.push(qcolor[verti*4], qcolor[verti*4+1], qcolor[verti*4+2], qcolor[verti*4+3]);
        if (qtex.length != 0) texes. push(-qtex [verti*2], qtex[verti*2+1]);//, qtex [i3]);
      }
      push(0); push(1); push(2); // tri1
      push(2); push(1); push(3); // tri2
    }
  }
});
