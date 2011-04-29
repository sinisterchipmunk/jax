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
      expect(shader.getInputMap({export_prefix:"shader0"})['mvMatrix']).toEqual("mvMatrix");
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
      expect(shader.getInputMap({export_prefix:"shader0"})['position']).toEqual("position");
    });
  });
  
  describe("with uniforms", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        vertex: "uniform mat4 mvMatrix; void main(void) { gl_Position = mvMatrix * vec4(0,0,0,1); }",
        name: "shader"
      });
    });
    
    it("should mangle the uniform name", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/uniform mat4 shader0_mvMatrix;/);
    });
    
    it("should mangle the uniform reference", function() {
      expect(shader.getVertexSource({export_prefix:"shader0"})).toMatch(/gl_Position = shader0_mvMatrix \* vec4/);
    });

    it("should add mvMatrix to the input map", function() {
      expect(shader.getInputMap({export_prefix:"shader0"})['mvMatrix']).toEqual("shader0_mvMatrix");
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
      expect(shader.getInputMap({export_prefix:"shader0"})['position']).toEqual("shader0_position");
    });
  });
  
  describe("with exports", function() {
    beforeEach(function() {
      shader = new Jax.Shader({
        fragment: "void main(void) { vec4 ambient; _shader_ambient = ambient; }",
        exports: {"ambient":"vec4"},
        name: "shader"
      });
    });
    
    it("should construct export definitions", function() {
      expect(shader.getExportDefinitions('shader')).toMatch(/vec4 _shader_ambient;/);
    });
    
    describe("and imports", function() {
      beforeEach(function() {
        shader = new Jax.Shader({
          fragment: "void main(void) { vec4 a = vec4(0); import(ambient, a += ambient); }",
//          exports: {"ambient":"vec4"},
          name: "shader"
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
