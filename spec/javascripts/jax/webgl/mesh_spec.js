describe("Mesh:", function() {
  var mesh;
  
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
      mesh.setColor(1,0,0,1);
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
        for (var i = 0; i < mesh.getVertexBuffer().js.length / 3; i += 4) {
          expect(cbuf.js[i+0]).toEqual(0.5);
          expect(cbuf.js[i+1]).toEqual(0);
          expect(cbuf.js[i+2]).toEqual(0.4);
          expect(cbuf.js[i+3]).toEqual(0.2);
        }
      });
    });
    
    it("should set color", function() {
      mesh.color = [0.5,0,0.4,0.2];
      mesh.rebuild();
      var cbuf = mesh.getColorBuffer();
      for (var i = 0; i < cbuf.js.length; i += 4) {
        expect(cbuf.js[i+0]).toEqual(0.5);
        expect(cbuf.js[i+1]).toEqual(0);
        expect(cbuf.js[i+2]).toEqual(0.4);
        expect(cbuf.js[i+3]).toEqual(0.2);
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
