if (typeof(global) != 'undefined') {
  /* WebGL arrays with length are initialized to 0, Array initializes to undefined. Since
   * we use Arrays within node.js, we need to produce WebGL-like results. We have particular
   * problems with tangent space calculations due to NaNs produced by undefined array elements.
   */

  describe("node-specific specs", function() {
    it("should initialize vec3 to [0,0,0]", function() {
      expect(vec3.create().length).toEqual(3);
      expect(vec3.create()).toEqualVector([0,0,0]);
    });
    
    it("should initialize mat3 to 3x3[0]", function() {
      expect(mat3.create().length).toEqual(9);
      expect(mat3.create()).toEqualVector([0,0,0,0,0,0,0,0,0]);
    });
    
    it("should initialize mat4 to 4x4[0]", function() {
      expect(mat4.create().length).toEqual(16);
      expect(mat4.create()).toEqualVector([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    });

    it("should initialize quat4 to [0,0,0,0]", function() {
      expect(quat4.create().length).toEqual(4);
      expect(quat4.create()).toEqualVector([0,0,0,0]);
    });
  });
}
