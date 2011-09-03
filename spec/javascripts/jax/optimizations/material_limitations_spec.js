describe("Jax.Material exceeding GPU limitations", function() {
  var matr, mesh;
  var layer, layer_class;
  var real = { varyings: Jax.Shader.max_varyings, uniforms: Jax.Shader.max_uniforms, attributes: Jax.Shader.max_attributes };
  
  beforeEach(function() {
    matr = new Jax.Material();
    mesh = new Jax.Mesh.Quad();
    // a layer that uses at least 1 of everything we'll test
    Jax.shaders['_debug_layer'] = new Jax.Shader({name:"_debug_layer",
                            common:"uniform float X; varying float Z;",
                            vertex:"attribute float Y; void main(void) { Z = X + Y; gl_Position = vec4(0,0,0,1); }",
                            fragment: "void main(void) { gl_FragColor = vec4(Z); }"
    });
    layer_class = Jax.Class.create(Jax.Material, {initialize:function($super) { $super({shader:"_debug_layer"}); }});
    layer = new layer_class();
    matr.addLayer(new Jax.Material.Lighting());
    matr.addLayer(layer);
  });
  
  afterEach(function() {
    Jax.Shader.max_varyings = real.varyings;
    Jax.Shader.max_uniforms = real.uniforms;
    Jax.Shader.max_attributes = real.attributes;
  });
  
  // fake out the max. number of varyings so we can test reliably
  function stub(what) {
    var chain = new Jax.ShaderChain();
    chain.addShader(Jax.shaders[Jax.default_shader]);
    switch(what) {
      case 'varyings':  Jax.Shader.max_varyings  = chain.countVaryings(matr);  break;
      case 'uniforms':  Jax.Shader.max_uniforms  = chain.countUniforms(matr);  break;
      case 'attributes':Jax.Shader.max_attributes= chain.countAttributes(matr);break;
      default: throw new Error("wtf?");
    }
  }
  
  describe("on number of varyings", function() {
    beforeEach(function() { stub('varyings'); });
    
    it("should first cull any materials which cannot possibly be used", function() {
      Jax.Shader.max_varyings++; // 1 for the most recent shader; render should produce 1 layer ('lighting'), not 0
      matr.render(SPEC_CONTEXT, mesh, {});
      // we expect it to be Lighting and not shader_class, because Lighting only has 1 varying. :)
      expect(matr.layers[0]).toBeKindOf(Jax.Material.Lighting);
    });
    
    it("should back off shader steps incrementally", function() {
      matr.render(SPEC_CONTEXT, mesh, {});
      expect(matr.layers.length).toEqual(0);
    });
  });

  describe("on number of attributes", function() {
    beforeEach(function() { stub('attributes'); });
    
    it("should first cull any materials which cannot possibly be used", function() {
      Jax.Shader.max_attributes++; // 1 for the most recent shader; render should produce 1 layer ('lighting'), not 0
      matr.render(SPEC_CONTEXT, mesh, {});
      // we expect it to be Lighting instead of layer_class, becuase LIghting has no varyings.
      expect(matr.layers[0]).toBeKindOf(Jax.Material.Lighting);
    });
    
    it("should back off shader steps incrementally", function() {
      matr.render(SPEC_CONTEXT, mesh, {});
      expect(matr.layers.length).toEqual(1); // see above
    });
  });
  
  describe("on number of uniforms", function() {
    beforeEach(function() { stub('uniforms'); });
    
    it("should first cull any materials which cannot possibly be used", function() {
      Jax.Shader.max_uniforms++; // 1 for the most recent shader; render should produce 1 layer ('shader_class'), not 0
      matr.render(SPEC_CONTEXT, mesh, {});
      expect(matr.layers[0]).toBeKindOf(layer_class);
    });
    
    it("should back off shader steps incrementally", function() {
      matr.render(SPEC_CONTEXT, mesh, {});
      expect(matr.layers.length).toEqual(0);
    });
  });
});
