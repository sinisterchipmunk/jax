describe("Jax.Mesh", function() {
  var mesh;
  
  describe("triangles", function() {
    describe("GL_TRIANGLES vertices", function() {
      beforeEach(function() {
        mesh = new Jax.Mesh({init: function(v) {
          this.draw_mode = GL_TRIANGLES;
          v.push(0,0,0,  1,0,0,  0,1,0);
          v.push(0,1,0,  1,0,0,  1,1,0);
        }});
      });
      
      it("should build triangles", function() {
        var tri1 = mesh.getTriangles()[0];
        var tri2 = mesh.getTriangles()[1];
        
        expect(tri1.a).toEqualVector([0,0,0]);
        expect(tri1.b).toEqualVector([1,0,0]);
        expect(tri1.c).toEqualVector([0,1,0]);

        expect(tri2.a).toEqualVector([0,1,0]);
        expect(tri2.b).toEqualVector([1,0,0]);
        expect(tri2.c).toEqualVector([1,1,0]);
      });
    });

    describe("GL_TRIANGLE_STRIP vertices", function() {
      beforeEach(function() {
        mesh = new Jax.Mesh({init: function(v) {
          this.draw_mode = GL_TRIANGLE_STRIP;
          v.push(0,0,0,  1,0,0);
          v.push(0,1,0,  1,1,0);
        }});
      });
      
      it("should build triangles", function() {
        var tri1 = mesh.getTriangles()[0];
        var tri2 = mesh.getTriangles()[1];
        
        expect(tri1.a).toEqualVector([0,0,0]);
        expect(tri1.b).toEqualVector([1,0,0]);
        expect(tri1.c).toEqualVector([0,1,0]);

        expect(tri2.a).toEqualVector([0,1,0]);
        expect(tri2.b).toEqualVector([1,0,0]);
        expect(tri2.c).toEqualVector([1,1,0]);
      });
    });

    describe("GL_TRIANGLE_FAN vertices", function() {
      beforeEach(function() {
        mesh = new Jax.Mesh({init: function(v) {
          this.draw_mode = GL_TRIANGLE_FAN;
          v.push(0,0,0,  1,0,0);
          v.push(1,1,0,  0,1,0);
        }});
      });
      
      it("should build triangles", function() {
        var tri1 = mesh.getTriangles()[0];
        var tri2 = mesh.getTriangles()[1];
        
        expect(tri1.a).toEqualVector([0,0,0]);
        expect(tri1.b).toEqualVector([1,0,0]);
        expect(tri1.c).toEqualVector([1,1,0]);

        expect(tri2.a).toEqualVector([0,0,0]);
        expect(tri2.b).toEqualVector([1,1,0]);
        expect(tri2.c).toEqualVector([0,1,0]);
      });
    });
  });
  
  describe("without vertices", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({init: function(v) { } });
      mesh.getBounds().left = 1;
      mesh.rebuild();
    });
    
    it("should be renderable", function() {
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
    
    it("should have valid (but zero) bounds", function() {
      expect(mesh.getBounds().left).toEqual(0);
      expect(mesh.getBounds().right).toEqual(0);
      expect(mesh.getBounds().top).toEqual(0);
      expect(mesh.getBounds().bottom).toEqual(0);
      expect(mesh.getBounds().front).toEqual(0);
      expect(mesh.getBounds().back).toEqual(0);
      expect(mesh.getBounds().width).toEqual(0);
      expect(mesh.getBounds().height).toEqual(0);
      expect(mesh.getBounds().depth).toEqual(0);
    });
  });
  
  describe("without normals", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({init: function(v) { v.push(0,1,0, -1,0,0, 1,0,0); }});
      mesh.rebuild();
    });
    
    it("should auto-generate the normals when requested, but not before", function() {
      // This is cheating BDD a bit because the only way to get the normal
      // buffer without requesting it is to access the mesh's private properties.
      // We'll test the data buffer and add some mocks, rather than test the data segments directly,
      // to make the test a little less brittle.
      expect((mesh.buffers.normal_buffer || {length:0}).length).toEqual(0);
      expect(mesh.getNormalBuffer().getTypedArray()).toEqualVector([
        0,0,1,  0,0,1,  0,0,1
      ]);
    });
  });
  
  describe("a torus", function() {
    beforeEach(function() { mesh = new Jax.Mesh.Torus(); mesh.rebuild(); });
    
    it("should build", function() { });
  });
  
  describe("#setColor", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh({init: function(vertices, colors) {
        vertices.push(0,0,0); // need a vertex to color
      }});
    });
    
    it("should set with rgba args", function() {
      try { mesh.setColor(1,0,0,1); } catch(e) { alert(e+"\n\n"+e.stack); }
      expect(mesh.getColorBuffer().getTypedArray()).toEqualVector([1,0,0,1]);
    });
    
    it("should set with vec4 args", function() {
      mesh.setColor([1,0,0,1]);
      expect(mesh.getColorBuffer().getTypedArray()).toEqualVector([1,0,0,1]);
    });
  });
  
  describe("a sphere", function() {
    beforeEach(function() { mesh = new Jax.Mesh.Sphere(); });
    
    describe("that is already built", function() {
      beforeEach(function() { mesh.rebuild(); });

      it("should set color", function() {
        mesh.color = [0.5,0,0.4,0.2];
        mesh.rebuild();
        var cbuf = mesh.getColorBuffer();
        var color = vec4.create();
        for (var i = 0; i < mesh.getVertexBuffer().js.length / 3; i += 4) {
          color[0] = cbuf.js[i]; color[1] = cbuf.js[i+1]; color[2] = cbuf.js[i+2]; color[3] = cbuf.js[i+3];
          expect(color).toEqualVector([0.5, 0, 0.4, 0.2]);
        }
      });
    });
    
    it("should set color", function() {
      mesh.color = [0.5,0,0.4,0.2];
      mesh.rebuild();
      var cbuf = mesh.getColorBuffer();
      var color = vec4.create();
      for (var i = 0; i < cbuf.js.length; i += 4) {
        color[0] = cbuf.js[i]; color[1] = cbuf.js[i+1]; color[2] = cbuf.js[i+2]; color[3] = cbuf.js[i+3];
        expect(color).toEqualVector([0.5, 0, 0.4, 0.2]);
      }
    });
  });
  
  describe("a simple quad", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh.Quad(2);
    });
    
    describe("with a specific material", function() {
      beforeEach(function() { mesh.material = 'basic'; });
      
      it("should use the specific material", function() {
        expect(mesh.getNormalizedRenderOptions().material.getName()).toEqual("basic");
      });
      
      it("should override the specific material", function() {
        expect(mesh.getNormalizedRenderOptions({material:"depthmap"}).material.name).toEqual("depthmap");
      });
    });
    
    it("should be renderable", function() {
      /*
        we can't verify that it's rendering *properly* without a human to verify -- but,
        we can at least assume that webgl will work properly, and check for other logical errors
        in the render process itself. For now I'm basically just seeing whether #render fails.
       */
      expect(function() { mesh.render(SPEC_CONTEXT); }).not.toThrow();
    });
    
    describe("that has been built", function() {
      beforeEach(function() { mesh.rebuild(); });
      
      it("should have appropriate boundaries", function() {
        expect(mesh.bounds.left).toEqual(-1);
        expect(mesh.bounds.right).toEqual(1);
        expect(mesh.bounds.top).toEqual(1);
        expect(mesh.bounds.bottom).toEqual(-1);
        expect(mesh.bounds.front).toEqual(0);
        expect(mesh.bounds.back).toEqual(0);
        expect(mesh.bounds.width).toEqual(2);
        expect(mesh.bounds.height).toEqual(2);
        expect(mesh.bounds.depth).toEqual(0);
      });
    });
  });
});
