describe("Built-in Shader Builder:", function() {
  var context;
  beforeEach(function() { context = new Jax.Context(document.getElementById('canvas-element')); });
  afterEach(function() { context.dispose(); });
  
  var shaders = Jax.Util.properties(Jax.shader_program_builders);
  for (var i = 0; i < shaders.length; i++)
  {
    describe(shaders[i], function() {
      var shader_name = shaders[i];
      it("should compile", function() {
        var matr = new Jax.Material({shaderType: shader_name});
        matr.render(context, new Jax.Mesh());
      });
    });
  }
});
