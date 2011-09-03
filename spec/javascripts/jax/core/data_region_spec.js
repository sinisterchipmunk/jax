describe("Jax.DataRegion", function() {
  var region;//, BYTES = 16*Float32Array.BYTES_PER_ELEMENT+4*Uint16Array.BYTES_PER_ELEMENT;
  
  describe("for default bytes", function() {
    beforeEach(function() { region = new Jax.DataRegion(); });
    
    it("remap with groups", function() {
      var vdata = region.map(Float32Array, 0);
      var vgroup = vdata.group(3);
      
      region.remap(vdata, 6);
      expect(vgroup.length).toEqual(2);
    });
    
    it("map several segments", function() {
      var vertices = [0,0,0], colors = [1,1,1,1], textureCoords = [], normals = [], indices = [1];
      
      var vertexData        = region.map(Float32Array, vertices);
      var colorData         = region.map(Float32Array, colors);
      var textureCoordsData = region.map(Float32Array, textureCoords);
      var normalData        = region.map(Float32Array, normals);
      var indices           = region.map(Uint16Array,  indices);
      
      expect(vertexData.length).toEqual(3);
      expect(colorData.length).toEqual(4);
      expect(textureCoordsData.length).toEqual(0);
      expect(normalData.length).toEqual(0);
      expect(indices.length).toEqual(1);
    });
    
    describe("map with default values", function() {
      it("standard", function() {
        var vertices = region.map(Float32Array, 4, [1,2,3,4]);
        expect(vertices.array).toEqualVector([1,2,3,4]);
      });
      
      it("without a length", function() {
        var colors = region.map(Float32Array, [0.0, 0.1, 0.2, 0.3]);
        expect(colors.array).toEqualVector([0.0, 0.1, 0.2, 0.3]);
      });
      
      it("with fewer elements in defaults than length", function() {
        expect(region.map(Float32Array, 4, [1,2,3]).array).toEqualVector([1,2,3,0]);
      });
    });
    
    describe("remap with default values", function() {
      it("standard", function() {
        var vertices = region.map(Float32Array, 4);
        region.remap(vertices, 3, [1,2,3]);
        expect(vertices.array).toEqualVector([1,2,3]);
      });
      
      it("without a length", function() {
        var colors = region.map(Float32Array, [0.0, 0.1, 0.2, 0.3]);
        region.remap(colors, [0.1, 0.2]);
        expect(colors.array).toEqualVector([0.1, 0.2]);
      });
      
      it("with fewer elements in defaults than length", function() {
        var n = region.map(Float32Array, 4, [1,2,3]);
        region.remap(n, 3, [4,3]);
        expect(n.array).toEqualVector([4,3,3]);
      });
    });
    
    describe("12-element Float32Array", function() {
      var vertices;
      beforeEach(function() {
        vertices = region.map(Float32Array, 12);
        for (var i = 0; i < 12; i++) vertices[i] = i;
      });
      
      it("should have length 12", function() { expect(vertices.length).toEqual(12); });
      
      describe("additional 4-element Uint16Array", function() {
        var indices;
        beforeEach(function() {
          indices = region.map(Uint16Array, 4);
          for (var i = 0; i < 4; i++)
            indices[i] = i;
        });
        
        it("should have length 4", function() { expect(indices.length).toEqual(4); });
        
        it("should share underlying buffer with vertices", function() {
          expect(indices.buffer).toBe(vertices.buffer);
        });
        
        it("should not share data with vertices", function() {
          indices[0] = 100;
          expect(vertices[0]).toEqual(0);
        });
        
        describe("remapping Float32Array into 16 elements", function() {
          beforeEach(function() { region.remap(vertices, 16); });
          
          it("should have length 16", function() {
            expect(vertices.length).toEqual(16);
          });
          
          it("should not overlap indices", function() {
            indices[0] = 100;
            for (var i = 0; i < 16; i++) vertices[i] = i;
            expect(indices[0]).toEqual(100);
          });
          
          it("should initialize new values to 0", function() {
            for (var i = 0; i < 4; i++) {
              expect(vertices[i+12]).toEqual(0);
            }
          });
        });
      });
    });
  });

});