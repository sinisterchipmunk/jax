describe("Jax.Util", function() {
  describe("merge", function() {
    var src, dst;
    describe("with a source with null attributes and destination with existing attributes of same name", function() {
      beforeEach(function() { src = {i:null}; dst = {i:5}; Jax.Util.merge(src,dst); });
      
      it("should copy null attributes", function() {
        expect(dst.i).toBeNull();
      });
    });
  });
  
  describe("normalizeOptions", function() {
    var normalized;
    describe("with a function value that defaults to null", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({onload:function(){}}, {onload:null}); });
      
      it("should assign the function value", function() {
        expect(typeof(normalized.onload)).toEqual("function");
      });
    });
    
    describe("with a missing value that defaults to null", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({}, {onload:null}); });
      
      it("should assign the default value", function() {
        expect(normalized.onload).toBeNull();
      });
    });
    
    describe("given values that are not in defaults", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({m:8,n:{o:9,p:0}}, {i:1,j:{k:2,l:3}}); });
      
      it("should contain defaults", function() {
        expect(normalized.i).toEqual(1);
        expect(normalized.j.k).toEqual(2);
        expect(normalized.j.l).toEqual(3);
      });
      
      it("should contain customs", function() {
        expect(normalized.m).toEqual(8);
        expect(normalized.n.o).toEqual(9);
        expect(normalized.n.p).toEqual(0);
      });
    });
    
    describe("given values that override defaults", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({i:8,j:{k:9,l:0}}, {i:1,j:{k:2,l:3}}); });
      
      it("should copy overrides", function() {
        expect(normalized.i).toEqual(8);
        expect(normalized.j.k).toEqual(9);
        expect(normalized.j.l).toEqual(0);
      });
    });
    
    describe("given undefined", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions(undefined, {i:1,j:{k:2,l:3}}); });
      
      it("should copy defaults", function() {
        expect(normalized.i).toEqual(1);
      });
      
      it("should copy nested defaults", function() {
        expect(normalized.j.k).toEqual(2);
        expect(normalized.j.l).toEqual(3);
      })
    });
  });
});