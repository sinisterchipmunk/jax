describe("Mesh:", function() {
  var mesh, context;
  
  beforeEach(function() { context = new Jax.Context(document.getElementById('canvas-element')); });
  afterEach(function() { context.dispose(); });
  
  describe("a torus", function() {
    beforeEach(function() { mesh = new Jax.Mesh.Torus(); mesh.rebuild(); });
    
  });
  
  describe("a simple quad", function() {
    beforeEach(function() {
      mesh = new Jax.Mesh.Quad(2);
    });
    
    it("should be renderable", function() {
      /*
        we can't verify that it's rendering *properly* without a human to verify -- but,
        we can at least assume that webgl will work properly, and check for other logical errors
        in the render process itself. For now I'm basically just seeing whether #render fails.
       */
      expect(function() { mesh.render(context); }).not.toThrow();
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
