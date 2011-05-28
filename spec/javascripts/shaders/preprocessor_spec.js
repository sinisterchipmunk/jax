describe("Preprocessor", function() {
  var context;
  var matr;
  
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

      setUniforms: function($super, context, mesh, options, uniforms) {
        $super(context, mesh, options, uniforms);
        uniforms.set('imvMatrix', context.getInverseModelViewMatrix());
      }
    });

    beforeEach(function() {
      context = new Jax.Context(document.getElementById('canvas-element'));
      matr = new Jax.Material();
      matr.addLayer(new TestMaterial());
    });

    afterEach(function() { context.dispose(); });

    it("should should not fail", function() {
      new Jax.Mesh({material:matr}).render(context);
    });
  });
});
