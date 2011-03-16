describe("Jax.Material", function() {
  var material;

  beforeEach(function() { material = new Jax.Material(); });

  describe("by default", function() {
    it("should have light-gray diffuse", function() { expect(material.colors.diffuse).toEqual([0.8,0.8,0.8, 1.0]); });
    it("should have dark-gray ambient",  function() { expect(material.colors.ambient).toEqual([0.02,0.02,0.02, 1.0]); });
    it("should have white specular",     function() { expect(material.colors.specular).toEqual([1,1,1, 1.0]);      });
    it("should have light-gray emissive",function() { expect(material.colors.emissive).toEqual([0,0,0, 1.0]);      });
    
    it("should have specular level 0",   function() { expect(material.specular).toEqual(0);                   });
    it("should have glossiness 10",      function() { expect(material.glossiness).toEqual(10);                });
    it("should have softness 0.1",       function() { expect(material.softness).toEqual(0.1);                 });
    it("should have opacity 1.0",        function() { expect(material.opacity).toEqual(1.0);                  });
    it("should use phong shader",        function() { expect(material.shaderType).toEqual('phong');           });
  });
  
  it("should have a default material", function() {
    expect(Jax.Material.find('default')).not.toBeUndefined();
  });
});
