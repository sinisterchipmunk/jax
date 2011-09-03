describe("Jax.DataSegment", function() {
  var seg;
  beforeEach(function() {
    seg = new Jax.DataSegment(Float32Array, 9);
    for (var i = 0; i < 9; i++) seg.array[i] = i;
  });
  
  describe("grouping", function() {
    var group;
    beforeEach(function() { group = seg.group(3); });
    
    it("should complain when array size is not divisible by group size", function() {
      expect(function() { seg.group(2); }).toThrow("Data segment size 9 is not divisible by group size 2");
    });
    
    it("should group data", function() {
      expect(group.length).toEqual(3);
      for (var i = 0; i < 3; i++)
        expect(group[i].array).toEqualVector([seg.array[i*3], seg.array[i*3+1], seg.array[i*3+2]]);
    });
    
    it("should update group when array changes", function() {
      var firstGroup = group[0];
      
      seg.setArray(new Float32Array([1, 2, 3, 4, 5, 6]));
      
      expect(group.length).toEqual(2);
      for (var i = 0; i < 2; i++)
        expect(group[i].array).toEqualVector([i*3+1, i*3+2, i*3+3]);
        
      expect(firstGroup).toBe(group[0]);
    });
  });
  
  xit("reflection", function() {
    // reflection is currently too slow to be used realistically
    // so it and its tests are disabled for now.
    seg.array[0] = 1;
    seg.array[1] = 2;
    seg.array[2] = 3;
    
    expect(seg[0]).toEqual(1);
    expect(seg[1]).toEqual(2);
    expect(seg[2]).toEqual(3);
    
    seg[0] = 4;
    seg[1] = 5;
    seg[2] = 6;
    
    expect(seg.array[0]).toEqual(4);
    expect(seg.array[1]).toEqual(5);
    expect(seg.array[2]).toEqual(6);
  });
  
  describe('getters', function() {
    xit("should be zero", function() {
      // see reflection
      expect(seg[0]).toEqual(0);
    });
  });
  
  describe("setters", function() {
    xit("by index", function() {
      // see reflection
      expect(seg[0] = 1).toEqual(1);
      expect(seg[0]).toEqual(1);
    });
    
    it("#set", function() {
      var f = new Float32Array(1);
      f[0] = 1;
      
      seg.set(f);
      expect(seg.array).toEqualVector([1,1,2,3,4,5,6,7,8]);
      
      seg.set(f, 2);
      expect(seg.array).toEqualVector([1,1,1,3,4,5,6,7,8]);
    });
  });
  
  it("#setArray", function() {
    // sanity check
    expect(Jax.Util.properties(seg.array)).toContain('2');
    
    seg.setArray(new Float32Array(2));

    expect(seg.length).toEqual(2);
    expect(Jax.Util.properties(seg.array)).not.toContain('2');
  });
  
  it("#subarray", function() {
    seg.set([1,2,3]);
    expect(seg.subarray(1,3).array).toEqualVector([2, 3]);
    expect(seg.subarray(1,3)).toBeKindOf(Jax.DataSegment);
  });
});
