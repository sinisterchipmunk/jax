Jax.Mesh.Sphere = Jax.Class.create(Jax.Mesh, {
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