describe("Cube", function() {
  var cube;
  
  beforeEach(function() { cube = new Jax.Mesh.Cube() });
  
  it("should build successfully", function() {
    var verts = [], colors = [], texes = [], norms = [];
    cube.init(verts, colors, texes, norms);
  });
});
