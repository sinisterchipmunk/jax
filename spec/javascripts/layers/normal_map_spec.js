describe("Material layer 'normal_map'", function() {
  var matr;
  
  describe("independently", function() {
    beforeEach(function() {
      matr = new Jax.Material({ layers: [ {type: "NormalMap", path: "/textures/normal_map.png" } ] });
    });

    it("should render successfully", function() {
      new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    });
  });
});
