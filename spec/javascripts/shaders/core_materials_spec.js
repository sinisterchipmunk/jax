describe("Core Materials", function() {
  var context;
  var matr;
  
  beforeEach(function() {
    context = new Jax.Context(document.getElementById('canvas-element'));
    matr = new Jax.Material();
  });
  
  afterEach(function() { context.dispose(); });
  
  var mats = Jax.Material.all();
  for (var i = 0; i < mats.length; i++) {
    describe(mats[i], function() {
      var name = mats[i];
      
      beforeEach(function() {
        if (name != "basic" && name != "default")
          matr.addLayer(Jax.Material.find(name));
      });

      it("should compile successfully", function() {
        spyOn(matr, 'prepareShader').andCallThrough();
        new Jax.Mesh({material:matr}).render(context);
        expect(matr.prepareShader).toHaveBeenCalled();
      });
      
      it("should coexist with all other builtins", function() {
        var m = new Jax.Material();
        if (name != "basic" && name != "default")
          m.addLayer(Jax.Material.find(name));
        
        for (var j = 0; j < mats.length; j++)
          if (mats[j] != "basic" && mats[j] != "default")
            m.addLayer(Jax.Material.find(mats[j]));
        
        new Jax.Mesh({material:m}).render(context);
      });
    });
  }
});
