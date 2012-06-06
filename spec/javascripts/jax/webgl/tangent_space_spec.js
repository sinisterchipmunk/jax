describe("Tangent space", function() {
  var mesh;
  it("should work with spheres", function() {
    expect(new Jax.Mesh.Sphere().getTangentBuffer().js).not.toBeEmpty();
  });
  
  describe("with a triangle strip", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh.Base({
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
        mesh.validate(); // to generate the buffer
        var _init = mesh.init;
        mesh.init = function(v, c, t, n, i) {
          _init(v, c, t, n);
          v.push(0, 0, 0);
          t.push(0.5, 0.5);
          n.push(0, 0, 1);
          i.push(4, 0, 1, 3, 2);
        };
        mesh.rebuild();
        mesh.draw_mode = GL_TRIANGLE_FAN;
      });

      it("should calculate tangents appropriately", function() {
        expect(mesh.rebuildTangentBuffer().js).toEqualVector([1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1]);
      });
    });
  });
  
  describe("with a triangle fan", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh.Base({
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
        init: function(verts, colors, textureCoords, normals, indices) {
          var width = 1, height = 1;
      
          verts.push(-width,  height, 0); // 0
          verts.push(-width, -height, 0); // 1, 4
          verts.push( width,  height, 0); // 2, 3
          verts.push( width, -height, 0); // 5

          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          colors.push(1,1,1,1);
          
          textureCoords.push(0, 1); // 0
          textureCoords.push(0, 0); // 1, 4
          textureCoords.push(1, 1); // 2, 3
          textureCoords.push(1, 0); // 5
      
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          normals.push(0,0,1);
          
          indices.push(0, 1, 2, 2, 1, 3);
        },
        
        draw_mode: GL_TRIANGLES
      });
    });
    
    it("should calculate tangents appropriately", function() {
      expect(mesh.getTangentBuffer().js).toEqualVector([1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1]);
    });
  });

});