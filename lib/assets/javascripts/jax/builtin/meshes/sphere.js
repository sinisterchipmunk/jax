/**
 * class Jax.Mesh.Sphere < Jax.Mesh
 *
 * A spherical mesh.
 *
 * Takes 3 options:
 *
 * * radius: the size of this sphere. Defaults to 1.
 * * slices: the number of lines of longitude. The higher this value is, the smoother and more perfect the sphere will
 *           appear but the more hardware-intensive rendering it will be. Defaults to 30.
 * * stacks: The number of lines of latitude. The higher this value is, the smoother and more perfect the sphere will
 *           appear but the more hardware-intensive rendering it will be. Defaults to 30.
 *
 * Examples:
 *
 *     new Jax.Mesh.Sphere({radius:2.0});
 *     new Jax.Mesh.Sphere({slices:8, stacks:8, radius: 10.0});
 *
 **/
Jax.Mesh.Sphere = Jax.Class.create(Jax.Mesh.TriangleStrip, {
  initialize: function($super, options) {
    options = options || {};
    this.slices = options.slices || 30;
    this.stacks = options.stacks || 30;
    this.radius = options.radius || 1;
    $super(options);
  },
  
  init: function(vertices, colors, textureCoords, normals, indices) {
    var slices = this.slices, stacks = this.stacks;
    var radius = this.radius;
    var slice, stack;
    for (slice = 0; slice <= slices; slice++) {
      var theta = slice * Math.PI / slices;
      var sinth = Math.sin(theta);
      var costh = Math.cos(theta);
          
      for (stack = 0; stack <= stacks; stack++) {
        var phi = stack * 2 * Math.PI / stacks;
        var sinph = Math.sin(phi);
        var cosph = Math.cos(phi);
            
        var x = cosph * sinth;
        var y = costh;
        var z = sinph * sinth;
        var u = 1 - (stack / stacks);
        var v = 1 - (slice / slices);
            
        normals.push(x, y, z);
        textureCoords.push(u, v);
        vertices.push(radius * x, radius * y, radius * z);
        colors.push(1, 1, 1, 1);
      }
    }
        
    for (slice = 0; slice < slices; slice++) {
      for (stack = 0; stack < stacks; stack++) {
        var first = (slice * (stacks + 1)) + stack;
        var second = first + stacks + 1;
        indices.push(first, second, first+1);
        indices.push(second, second+1, first+1);
      }
    }
  }
});
