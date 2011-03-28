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
    var x, z, vx, vz;

    for (x = 1; x < x_seg; x++) {
      for (z = 0; z < z_seg; z++) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx,        0, vz);
          verts.push(vx-x_unit, 0, vz);
          norms.push(0,1,0,  0,1,0);
      }

      for (z = z_seg-1; z >= 0; z--) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx-x_unit, 0, vz);
          verts.push(vx, 0, vz);
          norms.push(0,1,0,  0,1,0);
      }
    }
  }
});
