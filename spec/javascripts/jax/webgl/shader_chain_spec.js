describe("Jax.ShaderChain", function() {
  var chain, material, context;
  
  beforeEach(function() {
    material = new Jax.Material();
    context = new Jax.Context('canvas-element');
    chain = new Jax.ShaderChain("shader");
  });
  
  afterEach(function() { context.dispose(); });
  
  describe("with a vertex main with 1 unqualified argument", function() {
    beforeEach(function() {
      chain.addShader(new Jax.Shader({vertex:"void main(vec4 pos) { }",name:"one"}));
    });
    
    it("should mangle #main but keep the arguments", function() {
      expect(chain.getVertexSource(material)).toMatch(/void one0_main_v\(vec4 pos\) \{/);
    });
    
    it("should send the 3 arguments from #main", function() {
      expect(chain.getVertexSource(material)).toMatch(/one0_main_v\(gl_Position\);/);
    });
  });

  describe("with a fragment main with 3 unqualified arguments", function() {
    beforeEach(function() {
      chain.addShader(new Jax.Shader({fragment:"void main(vec4 amb, vec4 dif, vec4 spec) { }",name:"one"}));
    });
    
    it("should mangle #main but keep the arguments", function() {
      expect(chain.getFragmentSource(material)).toMatch(/void one0_main_f\(vec4 amb, vec4 dif, vec4 spec\) \{/);
    });
    
    it("should send the 3 arguments from #main", function() {
      expect(chain.getFragmentSource(material)).toMatch(/one0_main_f\(ambient, diffuse, specular\);/);
    });
  });
  
  describe("with a fragment main with 3 inout arguments", function() {
    beforeEach(function() {
      chain.addShader(new Jax.Shader({fragment:"void main(inout vec4 amb, inout vec4 dif, inout vec4 spec) { }",name:"one"}));
    });
    
    it("should mangle #main but keep the arguments", function() {
      expect(chain.getFragmentSource(material)).toMatch(/void one0_main_f\(inout vec4 amb, inout vec4 dif, inout vec4 spec\) \{/);
    });
    
    it("should send the 3 arguments from #main", function() {
      expect(chain.getFragmentSource(material)).toMatch(/one0_main_f\(ambient, diffuse, specular\);/);
    });
  });
  
  describe("with a local texture", function() {
    beforeEach(function() {
      chain.addShader(new Jax.Shader({vertex:"uniform sampler2D Texture; void main(void) { }",name:"one"}));
    });
    
    it("should rename the uniform", function() {
      expect(chain.getVertexSource(material)).toMatch(/uniform sampler2D one0_Texture;/);
    });
  });
  
  describe("with a local float uniform", function() {
    var prefix;
    beforeEach(function() {
      prefix = chain.addShader(new Jax.Shader({
                                      vertex:"uniform float TextureScaleX; void main(void) { float f = TextureScaleX; gl_Position = vec4(0,0,0,1); }",
                                      fragment:"void main(void) { }",name:"one"
      }));
    });
    
    it("should delegate to the expanded uniform name", function() {
      chain.link(context, material);
      chain.manifest.variable_prefix = prefix;
      chain.manifest.set('TextureScaleX', 1);
      var uniforms = chain.getUniformDelegator(context);
      spyOn(uniforms, 'set');
      chain.manifest.apply(uniforms, chain.getAttributeDelegator(context));
      
      expect(uniforms.set).toHaveBeenCalledWith(prefix+'TextureScaleX', 1);
    });
  });
  
  describe("with multiple identical uniforms", function() {
    beforeEach(function() {
      chain.addShader(new Jax.Shader({vertex:"shared uniform int x; void main(void) { }",name:"one"}));
      chain.addShader(new Jax.Shader({vertex:"shared uniform int x; void main(void) { }",name:"two"}));
    });
    
    it("should not redefine the uniform", function() {
      var source = chain.getVertexSource();
      expect(source.split(/uniform int x;/).length).toEqual(2);
    });
  });
  
  describe("with a shader that exports", function() {
    describe("and a shader that imports", function() {
      beforeEach(function() {
        chain.addShader(new Jax.Shader({vertex:"uniform int x; void main(void) { vec3 p; _shader_position = p;  gl_Position = vec4(0,0,0,1); }",
                                        fragment:"void main(void) { vec4 a; _shader_ambient = a; }",
                                        exports:{"ambient":"vec4", "position":"vec3"},
                                        name:"one"}));
        chain.addShader(new Jax.Shader({vertex:"void main(void) { vec3 p; import(position, p = position); }",
                                        fragment:"uniform float y; void main(void) { vec4 a; import(ambient, a = ambient); }",
                                        name:"two"}));
      });
      
      it("should produce a master shader", function() {
        chain.link(context, material);
        expect(chain.getMasterShader().getFragmentSource()).not.toBeNull();
        expect(chain.getMasterShader().getVertexSource()).not.toBeNull();
      });
      
      it("should produce an input map", function() {
        expect(Jax.Util.properties(chain.getInputMap(material))).toEqualVector(['one_x', 'one_y']);
      });
      
      describe(" - fragment - ", function() {
        it("should use local for uniform name", function() {
          expect(chain.getFragmentSource(material)).toMatch(/uniform float two1_y;/);
        });
        
        it("should perform import", function() {
          expect(chain.getFragmentSource(material)).toMatch(/a = _shader_ambient;/);
        });
      
        it("should define one_main", function() {
          expect(chain.getFragmentSource(material)).toMatch(/void one0_main_f\(void\)/);
        });

        it("should define two_main", function() {
          expect(chain.getFragmentSource(material)).toMatch(/void two1_main_f\(void\)/);
        });
      
        it("should define exported variables", function() {
          expect(chain.getFragmentSource(material)).toMatch(/vec4 _shader_ambient;/);
        });
      
        it("should build a main()", function() {
          expect(chain.getFragmentSource(material)).toMatch(/void main\(void/);
        });
      
        describe("#main", function() {
          it("should call main for 'one'", function() {
            expect(chain.getFragmentMain()).toMatch(/one0_main_f\(\);/);
          });

          it("should call main for 'two'", function() {
            expect(chain.getFragmentMain()).toMatch(/two1_main_f\(\);/);
          });
        });
      });
      
      describe(" - vertex - ", function() {
        it("should use local for uniform name", function() {
          expect(chain.getVertexSource(material)).toMatch(/uniform int one0_x;/);
        });
        
        it("should perform import", function() {
          expect(chain.getVertexSource(material)).toMatch(/p = _shader_position;/);
        });
        
        it("should define one_main", function() {
          expect(chain.getVertexSource(material)).toMatch(/void one0_main_v\(void\)/);
        });
        
        it("should define two_main", function() {
          expect(chain.getVertexSource(material)).toMatch(/void two1_main_v\(void\)/);
        });
        
        it("should define exported variables", function() {
          expect(chain.getVertexSource(material)).toMatch(/vec3 _shader_position;/);
        });
        
        it("should build a main()", function() {
          expect(chain.getVertexSource(material)).toMatch(/void main\(void/);
        });
        
        describe("#main", function() {
          it("should call main for 'one'", function() {
            expect(chain.getVertexMain()).toMatch(/one0_main_v\(\);/);
          });
          
          it("should call main for 'two'", function() {
            expect(chain.getVertexMain()).toMatch(/two1_main_v\(\);/);
          });
        });
      });
    });
  });
});