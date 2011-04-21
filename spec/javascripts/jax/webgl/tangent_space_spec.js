describe("Tangent space", function() {
  var mesh;
  it("should work with spheres", function() {
    expect(new Jax.Mesh.Sphere().getTangentBuffer().js).not.toBeEmpty();
  });
  
  describe("with a triangle strip", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({
        init: function(verts, colors, textureCoords, normals) {
          var width = 1, height = 1;
      
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
        },
        
        draw_mode: GL_TRIANGLE_STRIP
      });
    });
    
    describe("converted into a triangle fan", function() {
      beforeEach(function() {
        mesh.getTangentBuffer(); // to generate the buffer
        mesh.getVertexBuffer().js        = [0,0,0,   -1,1,0,  -1,-1,0,  1,-1,0,    1,1,0 ];
        mesh.getTextureCoordsBuffer().js = [0.5,0.5,    0,1    ,  0,0,     1,0,      1,1];
        mesh.getNormalBuffer().js        = [0,0,1,    0,0,1,    0,0,1,     0,0,1,  0,0,1];
        mesh.getVertexBuffer().refresh();
        mesh.getTextureCoordsBuffer().refresh();
        mesh.getNormalBuffer().refresh();
        mesh.draw_mode = GL_TRIANGLE_FAN;
      });

      it("should calculate tangents appropriately", function() {
        expect(mesh.rebuildTangentBuffer().js).toEqualVector([1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1]);
      });
    });
  });
  
  describe("with a triangle fan", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({
        init: function(verts, colors, textureCoords, normals) {
          var width = 1, height = 1;
      
          verts.push(0, 0, 0);
          verts.push(-width,  height, 0);
          verts.push(-width, -height, 0);
          verts.push( width, -height, 0);
          verts.push( width,  height, 0);

          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          
          textureCoords.push(0.5, 0.5);
          textureCoords.push(0, 1);
          textureCoords.push(0, 0);
          textureCoords.push(1, 0);
          textureCoords.push(1, 1);
      
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
        },
        
        draw_mode: GL_TRIANGLE_FAN
      });
    });
    
    it("should calculate tangents appropriately", function() {
      expect(mesh.getTangentBuffer().js).toEqualVector([1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1]);
    });
  });

  describe("with triangles", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({
        init: function(verts, colors, textureCoords, normals) {
          var width = 1, height = 1;
      
          verts.push(-width,  height, 0); // 0
          verts.push(-width, -height, 0); // 1
          verts.push( width,  height, 0); // 2
          
          verts.push( width,  height, 0); // 4
          verts.push(-width, -height, 0); // 3
          verts.push( width, -height, 0); // 5

          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          
          textureCoords.push(0, 1); // 0
          textureCoords.push(0, 0); // 1
          textureCoords.push(1, 1); // 2

          textureCoords.push(1, 1); // 4
          textureCoords.push(0, 0); // 3
          textureCoords.push(1, 0); // 5
      
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
        },
        
        draw_mode: GL_TRIANGLES
      });
    });
    
    it("should calculate tangents appropriately", function() {
      expect(mesh.getTangentBuffer().js).toEqualVector([1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1]);
    });
  });

});