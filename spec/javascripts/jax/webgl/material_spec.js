describe("Jax.Material", function() {
  var material, context, mesh;
  var _img = "/public/images/rss.png";
  
  beforeEach(function() { mesh = new Jax.Mesh(); context = new Jax.Context('canvas-element'); });
  afterEach(function() { context.dispose(); });

  describe("with one texture specified by string", function() {
    beforeEach(function() { material = new Jax.Material({texture: _img}); });
    it("should have a textures array", function() {
      expect(material.textures[0].image.src).toMatch(/\/public\/images\/rss\.png$/);
    });
  });
  
  describe("with multiple textures specified by string", function() {
    beforeEach(function() { material = new Jax.Material({textures: [_img, _img]}); });
    
    it("should have a textures array", function() {
      expect(material.textures[0].image.src).toMatch(/\/public\/images\/rss\.png$/);
      expect(material.textures[1].image.src).toMatch(/\/public\/images\/rss\.png$/);
    });
  });
  
  describe("by default", function() {
    beforeEach(function() { material = new Jax.Material(); });

    describe("switching shaders", function() {
      it("should not rebuild the shaders", function() {
        material.render(context, mesh, {shader:"basic"});
        material.render(context, mesh, {shader:"blinn-phong"});
        
        spyOn(material, 'buildShader').andCallThrough();
        material.render(context, mesh, {shader:"basic"});
        expect(material.buildShader).not.toHaveBeenCalled();
      });
      
      it("should build both shaders", function() {
        spyOn(material, 'buildShader').andCallThrough();
        material.render(context, mesh, {shader:"blinn-phong"});
        material.render(context, mesh, {shader:"basic"});
        expect(material.buildShader).toHaveBeenCalledWith('blinn-phong', context);
        expect(material.buildShader).toHaveBeenCalledWith('basic', context);
      });
    });
  
    it("should have light-gray diffuse", function() { expect(material.diffuse).toEqual([0.8,0.8,0.8, 1.0]);    });
    it("should have dark-gray ambient",  function() { expect(material.ambient).toEqual([0.02,0.02,0.02, 1.0]); });
    it("should have white specular",     function() { expect(material.specular).toEqual([1,1,1, 1.0]);         });
    it("should have light-gray emissive",function() { expect(material.emissive).toEqual([0,0,0, 1.0]);         });
    it("should have glossiness 10",      function() { expect(material.shininess).toEqual(10);                  });
    
    it("should use basic shader", function() {
      spyOn(material, 'prepareShader').andCallThrough();
      material.render(context, mesh);
      // I don't like this, but I don't know a better way to test it.
      expect(material.prepareShader).toHaveBeenCalledWith('basic', context);
    });
  });

  it("should have a default material", function() {
    expect(Jax.Material.find('default')).not.toBeUndefined();
  });
});
