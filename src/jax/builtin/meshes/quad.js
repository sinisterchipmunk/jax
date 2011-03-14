Jax.Mesh.Quad = (function() {
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      if (typeof(options) == "number") { options = {width:options, height:options}; }
      this.draw_mode = GL_TRIANGLE_STRIP;
      $super(options);
      
      this.setSize(options && options.width || 1, options && options.height || 1)
    },
    
    setWidth: function(width) { this.setSize(width, this.height); },
    
    setHeight:function(height){ this.setHeight(this.width, height); },
    
    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.rebuild();
    },
    
    init: function(verts, colors, textureCoords) {
      var width = this.width/2, height = this.height/2;
      
      verts.push(-width, -height, 0);
      verts.push(-width,  height, 0);
      verts.push( width, -height, 0);
      verts.push( width,  height, 0);

      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
          
      textureCoords.push(0, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 1);
      textureCoords.push(1, 0);
    }
  });
})();
