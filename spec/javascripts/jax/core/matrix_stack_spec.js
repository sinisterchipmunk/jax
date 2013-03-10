describe("Jax.MatrixStack", function() {
  var stack;
  
  beforeEach(function() { stack = new Jax.MatrixStack(); });
  
  it('should return a model matrix', function() { expect(stack.getModelMatrix()).toBeTruthy(); });
  it('should return a view matrix', function() { expect(stack.getViewMatrix()).toBeTruthy(); });
  it('should return a proj matrix', function() { expect(stack.getProjectionMatrix()).toBeTruthy(); });
  it('should return a mvp matrix', function() {
    expect(stack.getInverseModelViewMatrix()).toBeTruthy();
  });
      
  describe("with a pushed matrix", function() {
    beforeEach(function() { stack.push(); });
    
    it('should return a mvp matrix', function() {
      expect(stack.getInverseModelViewMatrix()).toBeTruthy();
    });

    it('should return a model matrix', function() { expect(stack.getModelMatrix()).toBeTruthy(); });
    it('should return a view matrix', function() { expect(stack.getViewMatrix()).toBeTruthy(); });
    it('should return a proj matrix', function() { expect(stack.getProjectionMatrix()).toBeTruthy(); });
      
    describe("translate", function() {
      beforeEach(function() { stack.loadViewMatrix(GLMatrix.mat4.translate(GLMatrix.mat4.create(), mat4.IDENTITY, [1,1,1])); });
      
      it("should not be an identity matrix", function() { expect(stack.getViewMatrix()).not.toEqualMatrix(mat4.IDENTITY); });
      
      it("should produce coords relative to eye", function() {
        var vec = GLMatrix.vec3.transformMat4([], [0,0,0], stack.getInverseViewMatrix());
        expect(vec).toEqualVector([-1,-1,-1]);
      });
    });
    
    it("should revert when popped", function() {
      GLMatrix.mat4.copy(stack.getModelMatrix(), [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4]);
      stack.pop();
      expect(stack.getModelMatrix()).toEqualVector(GLMatrix.mat4.identity(GLMatrix.mat4.create()));
    });
  });
});
