/**
 * class Jax.Mesh.Quad < Jax.Mesh
 * 
 * A simple square or rectangle. You can adjust its width and height, and that's about it.
 * 
 * This mesh is generally used for testing purposes, or for simple, textured objects like smoke particles.
 *
 * Options:
 *
 * * width : the width of this quad in units along the X axis. Defaults to +size+.
 * * height : the height of this quad in units along the Y axis. Defaults to +size+.
 * * size : a value to use for both width and height. Defaults to 1.0.
 *
 * Examples:
 * 
 *     var quad = new Jax.Mesh.Quad({width: 2, height: 1});
 *     var quad = new Jax.Mesh.Quad({size:1.5});
 * 
 **/
Jax.Mesh.Quad = (function() {
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      if (typeof(options) == "number") { options = {width:options, height:options}; }
      
      options = Jax.Util.normalizeOptions(options, {
        width:options && options.size ? options.size : 1,
        height:options && options.size ? options.size : 1
      });
      
      this.draw_mode = GL_TRIANGLE_STRIP;
      $super(options);
      
      this.setSize(options.width, options.height);
    },

    /**
     * Jax.Mesh.Quad#setWidth(width) -> undefined
     * - width (Number): the width of this quad in WebGL Units.
     * Sets the width of this quad.
     **/
    setWidth: function(width) { this.setSize(width, this.height); },
    
    /**
     * Jax.Mesh.Quad#setHeight(height) -> undefined
     * - height (Number): the height of this quad in WebGL Units.
     * Sets the height of this quad.
     **/
    setHeight:function(height){ this.setHeight(this.width, height); },
    
    /**
     * Jax.Mesh.Quad#setSize(width, height) -> undefined
     * - width (Number): the width of this quad in WebGL Units.
     * - height (Number): the height of this quad in WebGL Units.
     * Sets the width and height of this quad.
     **/
    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.rebuild();
    },
    
    init: function(verts, colors, textureCoords, normals) {
      var width = this.width/2, height = this.height/2;
      
      verts.push(-width,  height, 0);
      verts.push(-width, -height, 0);
      verts.push( width,  height, 0);
      verts.push( width, -height, 0);

      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
          
      textureCoords.push(0, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 1);
      textureCoords.push(1, 0);
      
      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
    }
  });
})();
