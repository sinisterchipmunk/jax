describe("Jax.Util", function() {
  describe("underscore", function() {
    it("should work", function() {
      expect(Jax.Util.underscore("Product")).toEqual("product");
      expect(Jax.Util.underscore("SpecialGuest")).toEqual("special_guest");
      expect(Jax.Util.underscore("ApplicationController")).toEqual("application_controller");
      expect(Jax.Util.underscore("Area51Controller")).toEqual("area51_controller");
      expect(Jax.Util.underscore("HTMLTidy")).toEqual('html_tidy');
      expect(Jax.Util.underscore('HTMLTidyGenerator')).toEqual('html_tidy_generator');
    });
  });
  
  describe("scan", function() {
    it("should process single-line comments", function() {
      expect(Jax.Util.scan("\n// )\n)")).toEqual("\n// )\n");
    });
    
    it("should process multi-line comments", function() {
      expect(Jax.Util.scan("\n/*\n)\n*/\n)")).toEqual("\n/*\n)\n*/\n");
    });
    
    it("should not choke on division", function() {
      expect(Jax.Util.scan("\n 1 / 2)")).toEqual("\n 1 / 2");
    });
  });
  
  describe("vectorize", function() {
    var data;
    
    describe("2D", function() {
      beforeEach(function() { data = [1, 2]; });
      
      it("should have length 2", function() { expect(Jax.Util.vectorize({x:0,y:1})).toEqualVector([0,1]); });
      it("should work", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2]); });
    });
    
    describe("with array", function() {
      beforeEach(function() { data = [1, 2, 3]; });
      
      it("should return the original vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
    });
    
    describe("with object with names", function() {
      beforeEach(function() { data = {x:1,y:2,z:3}; });
      it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
    });
    
    describe("with string", function() {
      describe("comma delimited", function() {
        beforeEach(function() { data = "1,2,3"; });
        it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      });
      describe("space delimited", function() {
        beforeEach(function() { data = "1 2 3"; });
        it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      });
      describe("comma-and-space delimited", function() {
        beforeEach(function() { data = "1, 2, 3"; });
        it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      });
      describe("tab delimited", function() {
        beforeEach(function() { data = "1\t2\t3"; });
        it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      });
      describe("comma-space-tab delimited", function() {
        beforeEach(function() { data = "1, \t2, \t3"; });
        it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      });
    });
    
    describe("colorize", function() {
      var data;
    
      describe("3D", function() {
        beforeEach(function() { data = [1, 2, 3]; });

        it("should work", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
      });

      describe("with object with short names", function() {
        beforeEach(function() { data = {r:1,g:2,b:3,a:4}; });
        it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
      });
    
      describe("with object with long names", function() {
        beforeEach(function() { data = {red:1,green:2,blue:3,alpha:4}; });
        it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
      });
    
      describe("with string", function() {
        describe("comma delimited", function() {
          beforeEach(function() { data = "1,2,3,4"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
        });
        describe("space delimited", function() {
          beforeEach(function() { data = "1 2 3 4"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
        });
        describe("comma-and-space delimited", function() {
          beforeEach(function() { data = "1, 2, 3, 4"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
        });
        describe("tab delimited", function() {
          beforeEach(function() { data = "1\t2\t3\t4"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
        });
        describe("comma-space-tab delimited", function() {
          beforeEach(function() { data = "1, \t2, \t3, \t4"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,4]); });
        });
      });

      describe("with object with short names and no alpha", function() {
        beforeEach(function() { data = {r:1,g:2,b:3}; });
        it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
      });
    
      describe("with object with long names and no alpha", function() {
        beforeEach(function() { data = {red:1,green:2,blue:3}; });
        it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
      });
    
      describe("with string", function() {
        describe("comma delimited and no alpha", function() {
          beforeEach(function() { data = "1,2,3"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
        });
        describe("space delimited and no alpha", function() {
          beforeEach(function() { data = "1 2 3"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
        });
        describe("comma-and-space delimited and no alpha", function() {
          beforeEach(function() { data = "1, 2, 3"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
        });
        describe("tab delimited and no alpha", function() {
          beforeEach(function() { data = "1\t2\t3"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
        });
        describe("comma-space-tab delimited and no alpha", function() {
          beforeEach(function() { data = "1, \t2, \t3"; });
          it("should produce a color", function() { expect(Jax.Util.colorize(data)).toEqualVector([1,2,3,1]); });
        });
      });
    });
    
    describe("with object with indices", function() {
      beforeEach(function() { data = {0:1,1:2,2:3}; });
      it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
    });
    
    describe("with a vector", function() {
      beforeEach(function() { data = [1,2,3]; });
      it("should produce a vector", function() { expect(Jax.Util.vectorize(data)).toEqualVector([1,2,3]); });
      xit("should not return itself", function() { expect(Jax.Util.vectorize(data)).not.toEqual(data); });
    });
  });
  
  describe("properties", function() {
    var src;
    beforeEach(function() { src = { prop1: 1, prop2: 2 }; });
    it("should return property names", function() {
      expect(Jax.Util.properties(src)).toEqual(['prop1', 'prop2']);
    });
  });
  
  describe("merge", function() {
    var src, dst;
    describe("with a source with null attributes and destination with existing attributes of same name", function() {
      beforeEach(function() { src = {i:null}; dst = {i:5}; Jax.Util.merge(src,dst); });
      
      it("should copy null attributes", function() {
        expect(dst.i).toBeNull();
      });
    });
  });
  
  describe("sizeofFormat", function() {
    it("should return size of ALPHA", function() { expect(Jax.Util.sizeofFormat(GL_ALPHA)).toEqual(1); });
    it("should return size of LUMINANCE", function() { expect(Jax.Util.sizeofFormat(GL_LUMINANCE)).toEqual(1); });
    it("should return size of RGB", function() { expect(Jax.Util.sizeofFormat(GL_RGB)).toEqual(3); });
    it("should return size of RGBA", function() { expect(Jax.Util.sizeofFormat(GL_RGBA)).toEqual(4); });
    it("should return size of LUMINANCE_ALPHA", function() { expect(Jax.Util.sizeofFormat(GL_LUMINANCE_ALPHA)).toEqual(2); });
    it("should fail", function() { expect(function(){Jax.Util.sizeofFormat(-12345);}).toThrow(); });
  });
  
  describe("enumName", function() {
    it("should work", function() {
      expect(Jax.Util.enumName(GL_TEXTURE_2D)).toEqual("GL_TEXTURE_2D");
    });
    
    describe("failure", function() {
      it("should contain the decimal form", function() {
        expect(Jax.Util.enumName(36059)).toMatch(/36059/);
      });

      it("should contain the hex form", function() {
        expect(Jax.Util.enumName(36059)).toMatch(/0x8cdb/);
      });
    });
  });
  
  describe("normalizeOptions", function() {
    var normalized;
    
    describe("with a false value that defaults to true", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({enabled:false}, {enabled:true}); });
      
      it("should not have a truthy value", function() {
        expect(normalized.enabled).toBeFalsy();
      });
    });
    
    describe("with a missing default array", function() {
      var arr = [1,2,3];
      beforeEach(function() { normalized = Jax.Util.normalizeOptions(null, {def:arr}); });
      
      it("should copy the default array", function() {
        expect(normalized.def.length).toEqual(arr.length);
        for (var i = 0; i < arr.length; i++)
          expect(normalized.def[i]).toEqual(arr[i]);
      });
    });
    
    describe("with only 1 argument", function() {
      it("should clone the argument", function() {
        expect(Jax.Util.normalizeOptions({i:1}).i).toEqual(1);
      });
    });
    
    describe("with a  object left and array right", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({p:{"x":20,"y":40,"z":60}}, {p:[1,2,3]}); });
      it("should merge both into a gen object", function() {
        expect(Object.isArray(normalized.p)).toBeFalsy();
  
        expect(normalized.p.x).toEqual(20);
        expect(normalized.p.y).toEqual(40);
        expect(normalized.p.z).toEqual(60);
        expect(normalized.p[0]).toEqual(1);
        expect(normalized.p[1]).toEqual(2);
        expect(normalized.p[2]).toEqual(3);
      });
    });
    
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
    
    describe("given a klass value", function() {
      beforeEach(function() { normalized = Jax.Util.normalizeOptions({k:new (Jax.Class.create({}))}, {}); });
      
      it("should be an instance of that klass", function() {
        expect(normalized.k.klass).not.toBeUndefined();
        expect(normalized.k).toBeInstanceOf(normalized.k.klass);
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