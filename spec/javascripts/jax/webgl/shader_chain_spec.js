describe("Jax.ShaderChain", function() {
  var chain, material, context;
  
  beforeEach(function() {
    material = new Jax.Material();
    context = new Jax.Context('canvas-element');
    chain = new Jax.ShaderChain("shader");
  });
  
  afterEach(function() { context.dispose(); });
  
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
        chain.addShader(new Jax.Shader({vertex:"uniform int x; void main(void) { vec3 p; _shader_position = p; }",
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