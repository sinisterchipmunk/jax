describe("Jax::Shader", function() {
  var shader;
  
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
        expect(shader.getFragmentSource({export_prefix:"shader",exports:{"ambient":"vec4"}})).toMatch(/vec4 a = vec4\(0\); a \+= _shader_ambient;/);
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
