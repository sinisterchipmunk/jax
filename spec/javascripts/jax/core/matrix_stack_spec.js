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
      beforeEach(function() { stack.loadViewMatrix(mat4.translate(mat4.IDENTITY, [1,1,1], mat4.create())); });
      
      it("should not be an identity matrix", function() { expect(stack.getViewMatrix()).not.toEqualMatrix(mat4.IDENTITY); });
      
      it("should produce coords relative to eye", function() {
        var vec = mat4.multiplyVec3(stack.getInverseViewMatrix(), [0,0,0]);
        expect(vec).toEqualVector([-1,-1,-1]);
      });
    });
    
    it("should revert when popped", function() {
      mat4.set([1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4], stack.getModelMatrix());
      stack.pop();
      expect(stack.getModelMatrix()).toEqualVector(mat4.identity());
    });
  });
});
