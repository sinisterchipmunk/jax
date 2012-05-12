/**
 * class Jax.Mesh.Torus < Jax.Mesh
 *
 * A torus is a donut-shaped mesh.
 *
 * Options:
 *
 * * inner_radius, default: 0.6
 * * outer_radius, default: 1.8
 * * sides, default: 128
 * * rings, default: 256
 *
 * Examples:
 *
 *     new Jax.Mesh.Torus();
 *     new Jax.Mesh.Torus({inner_radius: 1.0, outer_radius:3.0});
 *
 **/
Jax.Mesh.Torus = Jax.Class.create(Jax.Mesh.TriangleStrip, {
  initialize: function($super, options) {
    options = options || {};
    this.inner_radius = options.inner_radius === undefined ? 0.6 : options.inner_radius;
    this.outer_radius = options.outer_radius === undefined ? 1.8 : options.inner_radius;
    this.sides        = options.sides        === undefined ? 128 : options.inner_radius;
    this.rings        = options.rings        === undefined ? 256 : options.inner_radius;
    $super(options);
  },
  
  init: function(vertices, colors, texes, normals) {
    var tube_radius = this.inner_radius, radius = this.outer_radius, sides = this.sides, rings = this.rings;
    
    var i, j, theta, phi, theta1, costheta, sintheta, costheta1, sintheta1, ringdelta, sidedelta, cosphi, sinphi,
        dist;
    
    sidedelta = 2 * Math.PI / sides;
    ringdelta = 2 * Math.PI / rings;
    theta = 0;
    costheta = 1.0;
    sintheta = 0;
    
    for (i = rings - 1; i >= 0; i--) {
      theta1 = theta + ringdelta;
      costheta1 = Math.cos(theta1);
      sintheta1 = Math.sin(theta1);
      phi = 0;
      for (j = sides; j >= 0; j--) {
        phi = phi + sidedelta;
        cosphi = Math.cos(phi);
        sinphi = Math.sin(phi);
        dist = radius + (tube_radius * cosphi);
        
        normals.push(costheta1 * cosphi, -sintheta1 * cosphi, sinphi);
        vertices.push(costheta1 * dist, -sintheta1 * dist, tube_radius * sinphi);
        
        normals.push(costheta * cosphi, -sintheta * cosphi, sinphi);
        vertices.push(costheta * dist, -sintheta * dist, tube_radius * sinphi);
      }
      theta = theta1;
      costheta = costheta1;
      sintheta = sintheta1;
    }
  }
});
