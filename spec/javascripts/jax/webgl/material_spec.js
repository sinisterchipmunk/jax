describe("Jax.Material", function() {
  var material, mesh;
  var _img = "/images/rss.png";
  
  beforeEach(function() { mesh = new Jax.Mesh(); });
  
  describe("constructed as though from a Resource", function() {
    beforeEach(function() {
      material = new Jax.Material({
        name: "lighting_with_shadows",
        "ambient":{"red":1.0,"green":2.0,"blue":3.0,"alpha":4.0},
        "diffuse":{"red":0.2,"green":0.3,"blue":0.4,"alpha":0.5},
        "specular":{"red":0.6,"green":0.7,"blue":0.8,"alpha":0.9},
        "shininess":128,
        "layers":[
          {"type":"Texture","path":"/images/rock.png","flip_y":false,"scale":1},
          {"type":"NormalMap","path":"/images/rockNormal.png","flip_y":false,"scale":1},
          {"type":"ShadowMap"},
          {"type":"Fog","algorithm":"EXP2","start":10.0,"end":100.0,"density":0.0015,
            color:{"red":1.0,"green":1.0,"blue":1.0,"alpha":1.0}}
        ]
      });
    });
    
    it("should be usable", function() {
      material.render(SPEC_CONTEXT, mesh, {});
    });
    
    it("should have the correct name", function() {
      expect(material.getName()).toEqual("lighting_with_shadows");
    });
    
    it("should use the default shader", function() {
      expect(material.default_shader).toEqual(Jax.default_shader);
    });
    
    it("should have the correct ambient", function() { expect(material.ambient).toEqualVector([1,2,3,4]); });
    it("should have the correct diffuse", function() { expect(material.diffuse).toEqualVector([0.2,0.3,0.4,0.5]); });
    it("should have the correct specular", function() { expect(material.specular).toEqualVector([0.6,0.7,0.8,0.9]); });
    it("should have the correct shininess", function() { expect(material.shininess).toEqual(128); });
    it("should have 4 layers", function() { expect(material.layers.length).toEqual(4); });
    
    it("should have a texture map layer", function() {
      expect(material.layers[0].klass).toEqual(Jax.Material.Texture);
    });

    it("should have a normal map layer", function() {
      expect(material.layers[1].klass).toEqual(Jax.Material.NormalMap);
    });

    it("should have a shadow map layer", function() {
      expect(material.layers[2].klass).toEqual(Jax.Material.ShadowMap);
    });

    it("should have a fog layer", function() {
      expect(material.layers[3].klass).toEqual(Jax.Material.Fog);
    });
  });

  describe("with one texture specified by string", function() {
    beforeEach(function() { material = new Jax.Material({texture: _img}); });
    it("should have texture layer", function() {
      expect(material.layers[0].texture.image.src).toMatch(/\/images\/rss\.png$/);
    });
  });
  
  describe("with multiple textures specified by string", function() {
    beforeEach(function() { material = new Jax.Material({textures: [_img, _img]}); });
    
    it("should have 2 texture layers", function() {
      expect(material.layers[0].texture.image.src).toMatch(/\/images\/rss\.png$/);
      expect(material.layers[1].texture.image.src).toMatch(/\/images\/rss\.png$/);
    });
  });
  
  describe("with a normal map", function() {
    beforeEach(function() { material = new Jax.Material({texture:{path:_img,type:Jax.NORMAL_MAP}}); });
    it("should use Jax.Material.NormalMap", function() {
      expect(material.layers[0]).toBeKindOf(Jax.Material.NormalMap);
    });
  });
  
  describe("by default", function() {
    beforeEach(function() { material = new Jax.Material(); });

    describe("switching shaders", function() {
      it("should not rebuild the shaders", function() {
        material.render(SPEC_CONTEXT, mesh, {shader:"basic"});
        material.render(SPEC_CONTEXT, mesh, {shader:"blinn-phong"});
        
        spyOn(material, 'buildShader').andCallThrough();
        material.render(SPEC_CONTEXT, mesh, {shader:"basic"});
        expect(material.buildShader).not.toHaveBeenCalled();
      });
      
//      it("should build both shaders", function() {
//        spyOn(material, 'buildShader').andCallThrough();
//        material.render(SPEC_CONTEXT, mesh, {shader:"blinn-phong"});
//        material.render(SPEC_CONTEXT, mesh, {shader:"basic"});
//        expect(material.buildShader).toHaveBeenCalledWith('blinn-phong', SPEC_CONTEXT);
//        expect(material.buildShader).toHaveBeenCalledWith('basic', SPEC_CONTEXT);
//      });
    });
  
    
//    it("should use basic shader", function() {
//      spyOn(material, 'prepareShader').andCallThrough();
//      material.render(SPEC_CONTEXT, mesh);
//      // I don't like this, but I don't know a better way to test it.
//      expect(material.prepareShader).toHaveBeenCalledWith('basic', SPEC_CONTEXT);
//    });
  });

  it("should have a default material", function() {
    expect(Jax.Material.find('default')).not.toBeUndefined();
  });
});
