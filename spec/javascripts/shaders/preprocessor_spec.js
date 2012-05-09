describe("Preprocessor", function() {
  var matr;
  
  beforeEach(function() {
    matr = new Jax.Material();
  });
  
  it("should be able to determine shader type from within common code", function() {
    Jax.shaders['test'] = new Jax.Shader({
      common: "void <%=shader_type%>(void) { return; }",
      vertex: "void main(void) { gl_Position = vec4(0,0,0,1); }",
      fragment: "void main(void) { discard; }",
      name: "test"
    });
    
    expect(Jax.shaders['test'].getVertexSource(matr)).toMatch(/void vertex\(void\)/);
    expect(Jax.shaders['test'].getFragmentSource(matr)).toMatch(/void fragment\(void\)/);
  });
  
  describe("with multiple similar vardecs", function() {
    Jax.shaders['test'] = new Jax.Shader({
      vertex: "shared uniform mat4 ivMatrix, mvMatrix, pMatrix, vMatrix;\n" +
              "uniform mat4 imvMatrix;\n" +
              "void main(void) { gl_Position = pMatrix * imvMatrix * vec4(0,0,0,1); }",
      fragment: "void main(void) { }",
      name: "test"
    });

    var TestMaterial = Jax.Class.create(Jax.Material, {
      initialize: function($super) { $super({shader: "test"}); },

      setVariables: function(context, mesh, options, vars) {
        vars.set('imvMatrix', context.matrix_stack.getInverseModelViewMatrix());
      }
    });

    beforeEach(function() {
      matr.addLayer(new TestMaterial());
    });

    it("should should not fail", function() {
      new Jax.Mesh({material:matr}).render(SPEC_CONTEXT);
    });
  });
});
