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
    
    var w = options.width, h = options.height, d = options.depth;
    this.sides = {};

    this.sides.left = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.sides.left.camera.orient([-1,0,0], [0,1,0], [-w/2,0,0]);

    this.sides.right = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.sides.right.camera.orient([1,0,0], [0,1,0], [w/2,0,0]);

    this.sides.front = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.sides.front.camera.orient([0,0,1], [0,1,0], [0,0,d/2]);

    this.sides.back = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.sides.back.camera.orient([0,0,-1], [0,1,0], [0,0,-d/2]);

    this.sides.top = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.sides.top.camera.orient([0,1,0], [0,0,1], [0,h/2,0]);

    this.sides.bottom = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.sides.bottom.camera.orient([0,-1,0], [0,0,-1], [0,-h/2,0]);
  },
  
  init: function(verts, colors, texes, norms) {
    // we need to get each quad's vertices, but then transform them by the object's
    // local transformation, which includes the position offset and direction.
    
    var matrix;
    for (var i in this.sides)
    {
      var qverts = [], qcolor = [], qtex = [], qnorm = [];
      this.sides[i].mesh.init(qverts, qcolor, qtex, qnorm, []);
      matrix = this.sides[i].camera.getTransformationMatrix();

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
