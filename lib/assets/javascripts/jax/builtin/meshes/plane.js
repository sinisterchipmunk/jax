/**
 * class Jax.Mesh.Plane < Jax.Mesh
 *
 * Constructs a multi-polygonal flat plane treating the center of
 * the plane as the origin.
 *
 * Options:
 *
 * * width : the width of the cube in units. Defaults to +size+.
 * * depth : the depth of the cube in units. Defaults to +size+.
 * * size : a value to use for any of the other dimensional options if
 * they are unspecified. Defaults to 500.0.
 * * x_segments : the number of vertices along the plane's X axis.
 * Defaults to +segments+.
 * * z_segments : the number of vertices along the plane's Z axis.
 * Defaults to +segments+.
 * * segments : a value to use for any of the other segment count options
 * if they are unspecified. Defaults to 20.
 *
 * Examples:
 *
 *     new Jax.Mesh.Plane();
 *     new Jax.Mesh.Plane({size:2});
 *     new Jax.Mesh.Plane({width:2});
 *     new Jax.Mesh.Plane({width:2,x_segments:2});
 *
 **/
Jax.Mesh.Plane = Jax.Class.create(Jax.Mesh.TriangleStrip, {
  initialize: function($super, options) {
    options = options || {};
    this.width = options.width || options.size || 500;
    this.depth = options.depth || options.size || 500;
    this.x_segments = options.x_segments || options.segments || 20;
    this.z_segments = options.z_segments || options.segments || 20;
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
          verts.push(vx,        vz, 0);
          verts.push(vx-x_unit, vz, 0);
          norms.push(0,0,-1,  0,0,-1);
          texes.push(x / (x_seg-1), z / (z_seg-1));
          texes.push((x-1) / (x_seg-1), z / (z_seg-1));
      }

      for (z = z_seg-1; z >= 0; z--) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx-x_unit, vz, 0);
          verts.push(vx, vz, 0);
          norms.push(0,0,-1,  0,0,-1);
          texes.push((x-1) / (x_seg-1), z / (z_seg-1));
          texes.push(x / (x_seg-1), z / (z_seg-1));
      }
    }
  }
});
