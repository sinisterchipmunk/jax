describe("Material layer 'texture'", function() {
  var matr;
  
  describe("independently", function() {
    beforeEach(function() {
      matr = new Jax.Material({ layers: [ {type: "Texture", path: "/textures/rock.png" } ] });
    });

    it("should render successfully", function() {
      new Jax.Mesh.Triangles({material:matr}).render(SPEC_CONTEXT);
    });
  });
});
