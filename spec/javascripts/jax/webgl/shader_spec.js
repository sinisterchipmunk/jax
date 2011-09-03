describe("Jax::Shader", function() {
  var shader;
  
  describe("with shared uniforms", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "shared uniform mat4 mvMatrix; void main(void) { gl_Position = mvMatrix * vec4(0,0,0,1); }",
        name: "shader"
      });
    });
    
    it("should not mangle the uniform name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/uniform mat4 shader0_mvMatrix;/);
    });
    
    it("should not mangle the uniform reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/gl_Position = shader0_mvMatrix \* vec4/);
    });
    
    it("should not include the word 'shared'", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/shared/);
    });
    
    it("should add mvMatrix to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['mvMatrix'].full_name).toEqual("mvMatrix");
    });
  });
  
  describe("with shared attributes", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "shared attribute vec4 position; void main(void) { gl_Position = mvMatrix * position; }",
        name: "shader"
      });
    });
    
    it("should not mangle the attribute name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/attribute vec4 shader0_position;/);
    });
    
    it("should not mangle the attribute reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/gl_Position = mvMatrix \* shader0_position/);
    });
    
    it("should not include the word 'shared'", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).not.toMatch(/shared/);
    });
    
    it("should add position to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['position'].full_name).toEqual("position");
    });
  });
  
  describe("with shared varyings", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "shared varying vec2 tex; void main(void) { tex = vec2(1,1); }",
        fragment: "shared varying vec2 tex; void main(void) { gl_FragCoord = tex.xy; }",
        name: "shader"
      });
    });
    
    it("should not mangle the vertex varying name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/varying vec2 tex;/);
    });
    
    it("should not mangle the vertex varying reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/ tex = vec2\(1,1\);/);
    });

    it("should add tex to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['tex'].full_name).toEqual("tex");
    });

    it("should not mangle the fragment varying name", function() {
      expect(shader.getFragmentSource({export_prefix:"shader0"})).toMatch(/varying vec2 tex;/);
    });
    
    it("should not mangle the fragment varying reference", function() {
      expect(shader.getFragmentSource({export_prefix:"shader0"})).toMatch(/ gl_FragCoord = tex.xy;/);
    });
  });
  
  describe("with uniforms", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "uniform mat4 mvMatrix; void main(void) { gl_Position = mvMatrix * vec4(0,0,0,1); }",
        name: "shader-name"
      });
    });
    
    it("should mangle the uniform name", function() {
      expect(shader.getVertexSource({export_prefix:"shader-name0"})).toMatch(/uniform mat4 shader_name0_mvMatrix;/);
    });
    
    it("should mangle the uniform reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader-name0"})).toMatch(/gl_Position = shader_name0_mvMatrix \* vec4/);
    });

    it("should add mvMatrix to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader-name0"})['mvMatrix'].full_name).toEqual("shader_name0_mvMatrix");
    });
  });
  
  describe("with attributes", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "attribute vec4 position; void main(void) { gl_Position = mvMatrix * position; }",
        name: "shader"
      });
    });
    
    it("should mangle the attribute name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/attribute vec4 shader0_position;/);
    });
    
    it("should mangle the attribute reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/gl_Position = mvMatrix \* shader0_position/);
    });

    it("should add mvMatrix to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['position'].full_name).toEqual("shader0_position");
    });
  });
  
  describe("with varyings", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "varying vec2 tex; void main(void) { tex = vec2(1,1); }",
        fragment: "varying vec2 tex; void main(void) { gl_FragCoord = tex.xy; }",
        name: "shader"
      });
    });
    
    it("should mangle the vertex varying name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/varying vec2 shader0_tex;/);
    });
    
    it("should mangle the vertex varying reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/ shader0_tex = vec2\(1,1\);/);
    });

    it("should add tex to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['tex'].full_name).toEqual("shader0_tex");
    });

    it("should mangle the fragment varying name", function() {
      expect(shader.getFragmentSource({export_prefix:"shader0"})).toMatch(/varying vec2 shader0_tex;/);
    });
    
    it("should mangle the fragment varying reference", function() {
      expect(shader.getFragmentSource({export_prefix:"shader0"})).toMatch(/ gl_FragCoord = shader0_tex.xy;/);
    });
  });
  
  describe("with implicitly valued exports", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        fragment: "void main(void) { vec4 ambient; export(vec4, ambient); }",
        exports: {"ambient":"vec4"},
        name: "shader"
      });
    });
    
    it("should construct export definitions", function() {
      expect(shader.getExportDefinitions('shader')).toMatch(/vec4 _shader_ambient;/);
    });
    
    it("should add export definitions to source", function() {
      expect(shader.getFragmentSource()).toMatch(/vec4 _shader_ambient;/);
    });
    
    describe("and an overriding prefix", function() {
      var options;
      beforeEach(function() { options = { export_prefix: "test" }; });
      
      it("should define the overriding prefix", function() {
        expect(shader.getFragmentSource(options)).toMatch(/vec4 _test_ambient;/);
      });
      
      it("should reference the overriding prefix", function() {
        expect(shader.getFragmentSource(options)).toMatch(/ _test_ambient = ambient;/);
      });
    });
  });
  
  describe("with exports", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
//        fragment: "void main(void) { vec4 ambient; _shader_ambient = ambient; }",
        fragment: "void main(void) { vec4 ambient; export(vec4, ambient, ambient); }",
        exports: {"ambient":"vec4"},
        name: "shader"
      });
    });
    
    describe("without spaces", function() {
      beforeEach(function() {
        shader = new Jax.Shader({
          fragment: "void main(void) { vec4 ambient; export(vec4,ambient,ambient); }",
          exports: {"ambient":"vec4"},
          name: "shader"
        });
      });

      it("should construct export definitions", function() {
        expect(shader.getExportDefinitions('shader')).toMatch(/vec4 _shader_ambient;/);
      });
    });
    
    it("should construct export definitions", function() {
      expect(shader.getExportDefinitions('shader')).toMatch(/vec4 _shader_ambient;/);
    });
    
    it("should add export definitions to source", function() {
      expect(shader.getFragmentSource()).toMatch(/vec4 _shader_ambient;/);
    });
    
    describe("and an overriding prefix", function() {
      var options;
      beforeEach(function() { options = { export_prefix: "test" }; });
      
      it("should define the overriding prefix", function() {
        expect(shader.getFragmentSource(options)).toMatch(/vec4 _test_ambient;/);
      });
      
      it("should reference the overriding prefix", function() {
        expect(shader.getFragmentSource(options)).toMatch(/ _test_ambient = ambient;/);
      });
    });
    
    describe("and imports", function() {
      beforeEach(function() {
        shader = new Jax.Shader({
          fragment: "void main(void) { vec4 a = vec4(0); import(ambient, a += ambient); }",
//          exports: {"ambient":"vec4"},
          name: "shader"
        });
      });
    
      describe("without spaces", function() {
        beforeEach(function() {
          shader = new Jax.Shader({
            fragment: "void main(void) { vec4 a = vec4(0); import(ambient,a+=ambient); }",
            name: "shader"
          });
        });
    
        it("should use the export", function() {
          expect(shader.getFragmentSource({export_prefix:"shader",exports:{"ambient":"vec4"}}))
                  .toMatch(/vec4 a = vec4\(0\); a\+=_shader_ambient;/);
        });
      }); 
    
      it("should use the export", function() {
        expect(shader.getFragmentSource({export_prefix:"shader",exports:{"ambient":"vec4"}}))
                .toMatch(/vec4 a = vec4\(0\); a \+= _shader_ambient;/);
      });
    });
  });
  
  describe("with no export and an import", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        fragment: "void main(void) { vec4 a = vec4(0); import(ambient, a += ambient); }",
//        exports: {"ambient":"vec4"},
        name: "shader"
      });
    });
    
    it("should use the default", function() {
      expect(shader.getFragmentSource()).toMatch(/vec4 a = vec4\(0\);/);
      expect(shader.getFragmentSource()).not.toMatch(/a += _shader_ambient;/);
    });
  });
});
