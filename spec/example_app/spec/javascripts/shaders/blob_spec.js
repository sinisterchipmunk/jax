describe("Shader 'blob'", function() {
  var context, material, mesh;
  
    beforeEach(function() {
      context = new Jax.Context('webgl-canvas');
      mesh = new Jax.Mesh.Quad();
    });
  
    afterEach(function() { context.dispose(); });
  
    describe("stand-alone", function() {
      beforeEach(function() { mesh.material = new Jax.Material.Blob(); });
  
      xit("should render without error", function() {
        expect(function() { mesh.render(context); }).not.toThrow();
      });
    });
  
    describe("as a layer", function() {
      beforeEach(function() {
        mesh.material = new Jax.Material({layers:[{
          type:"Blob"
        }]});
      });
  
      xit("should render without error", function() {
        expect(function() { mesh.render(context); }).not.toThrow();
      });
    });
});
