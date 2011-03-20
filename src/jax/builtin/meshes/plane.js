Jax.Mesh.Plane = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    options = options || {};
    this.width = options.width || options.size || 500;
    this.depth = options.depth || options.size || 500;
    this.x_segments = options.x_segments || options.segments || 20;
    this.z_segments = options.z_segments || options.segments || 20;
    this.draw_mode = GL_TRIANGLE_STRIP;
    $super(options);
  },
  
  init: function(verts, colors, texes, norms) {
    var w = this.width, d = this.depth, x_seg = this.x_segments, z_seg = this.z_segments;
    
    var x_unit = w / x_seg, z_unit = d / z_seg;
    for (var x = 1; x < x_seg; x++) {
      for (var i = -1; i < 2; i += 2) {
        for (var z = (i == -1 ? 0 : z_seg-1); z < z_seg && z >= 0; z += i) {
          var vx = x_unit * x;
          var vz = z_unit * z;
          verts.push(vx-w/2, 0, vz-d/2);
          norms.push(0,1,0);
          verts.push(vx-x_unit-w/2, 0, vz-d/2);
          norms.push(0,1,0);
        }
      }
    }
  }
});
