describe "Jax.Material.Layer", ->
  # Normally we wouldn't test a class calling its own methods, but it
  # is necessary in this case to ensure the layer API works as expected
  # when inherited.
  
  layer = mesh = model = shader = varmap = null
  beforeEach ->
    class Jax.Material.TestLayer extends Jax.Material.Layer
      setVariables: (ctx, mesh, model, vars) -> 
    varmap = {}
    layer = new Jax.Material.TestLayer {name: "one"}
    mesh = new Jax.Mesh.Triangles()
    model = new Jax.Model()
    shader = new Jax.Shader.Program()
    
  afterEach -> delete Jax.Material.TestLayer
  
  it "should call `setVariables` during setup", ->
    spyOn layer, 'setVariables'
    layer.setup SPEC_CONTEXT, mesh, model, shader
    expect(layer.setVariables).toHaveBeenCalled() # With SPEC_CONTEXT, mesh, model, varmap
