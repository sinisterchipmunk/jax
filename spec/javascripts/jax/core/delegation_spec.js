describe("Delegation", function() {
  /* see src/jax/prototype/extensions.js */
  var klass;
  
  beforeEach(function() { klass = Jax.Class.create({initialize:function(){this.matrix_stack=new Jax.MatrixStack();}}); });
  
  it("should delegate via string", function() {
    klass.delegate("getProjectionMatrix", "loadModelMatrix").into("matrix_stack");
    
    var src = new klass();
    spyOn(src.matrix_stack, 'getProjectionMatrix');
    spyOn(src.matrix_stack, 'loadModelMatrix');
    
    src.getProjectionMatrix();
    src.loadModelMatrix(mat4.create());
    
    expect(src.matrix_stack.getProjectionMatrix).toHaveBeenCalled();
    expect(src.matrix_stack.loadModelMatrix).toHaveBeenCalled();
  });
  
  it("should delegate via regexp with explicit klass", function() {
    klass.delegate(/^(get|load|mult)(.*)Matrix$/).into("matrix_stack", Jax.MatrixStack);
    
    var src = new klass();
    spyOn(src.matrix_stack, 'getProjectionMatrix');
    spyOn(src.matrix_stack, 'loadModelMatrix');
    
    src.getProjectionMatrix();
    src.loadModelMatrix(mat4.create());
    
    expect(src.matrix_stack.getProjectionMatrix).toHaveBeenCalled();
    expect(src.matrix_stack.loadModelMatrix).toHaveBeenCalled();
  });
  
  it("should delegate via regexp without explicit klass", function() {
    klass.delegate(/^(get|load|mult)(.*)Matrix$/).into("matrix_stack");
    
    var src = new klass();
    spyOn(src.matrix_stack, 'getProjectionMatrix');
    spyOn(src.matrix_stack, 'loadModelMatrix');
    
    src.getProjectionMatrix();
    src.loadModelMatrix(mat4.create());
    
    expect(src.matrix_stack.getProjectionMatrix).toHaveBeenCalled();
    expect(src.matrix_stack.loadModelMatrix).toHaveBeenCalled();
  });
});