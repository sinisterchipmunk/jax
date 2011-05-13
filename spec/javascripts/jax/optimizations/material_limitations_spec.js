describe("Jax.Material exceeding GPU limitations", function() {
  var matr, context, mesh;
  var layer;
  var real = { varyings: Jax.Shader.max_varyings, uniforms: Jax.Shader.max_uniforms, attributes: Jax.Shader.max_attributes };
  
  beforeEach(function() {
    matr = new Jax.Material();
    mesh = new Jax.Mesh.Quad();
    context = new Jax.Context('canvas-element');
    // a layer that uses at least 1 of everything we'll test
    Jax.shaders['_debug_layer'] = new Jax.Shader({name:"_debug_layer",
                            common:"uniform float X; varying float Z;",
                            vertex:"attribute float Y; void main(void) { Z = X + Y; gl_Position = vec4(0,0,0,1); }",
                            fragment: "void main(void) { gl_FragColor = vec4(Z); }"
    });
    var layer_class = Jax.Class.create(Jax.Material, {initialize:function($super) { $super({shader:"_debug_layer"}); }});
    layer = new layer_class();
    matr.addLayer(layer);
  });
  
  afterEach(function() {
    context.dispose();
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
    
    it("should back off shader steps incrementally", function() {
      matr.render(context, mesh, {});
      expect(matr.layers.length).toEqual(0);
    });
  });

  describe("on number of attributes", function() {
    beforeEach(function() { stub('attributes'); });
    
    it("should back off shader steps incrementally", function() {
      matr.render(context, mesh, {});
      expect(matr.layers.length).toEqual(0);
    });
  });
  
  describe("on number of uniforms", function() {
    beforeEach(function() { stub('uniforms'); });
    
    it("should back off shader steps incrementally", function() {
      matr.render(context, mesh, {});
      expect(matr.layers.length).toEqual(0);
    });
  });
});
