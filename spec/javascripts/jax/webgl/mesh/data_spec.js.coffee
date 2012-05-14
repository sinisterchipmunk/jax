describe "Jax.Mesh.Data", ->
  data = null
  
  describe "with only vertex data", ->
    beforeEach ->
      data = new Jax.Mesh.Data [1, 2, 3]
      
    describe "after setting color to red", ->
      beforeEach -> data.color = [255, 0, 0, 255]
      
      it "should change color buffer to red", ->
        expect(data.colorBuffer).toEqualVector [255, 0, 0, 255]
      
    it "should store vertex data", ->
      expect(data.vertexBuffer).toEqualVector [1, 2, 3]
    
    it "should default color to white", ->
      expect(data.colorBuffer).toEqualVector [255, 255, 255, 255]
      
    it "should default normal to normalized vertex position", ->
      expect(data.normalBuffer).toEqualVector vec3.normalize([1, 2, 3])
      
    it "should default textures to 0", ->
      expect(data.textureCoordsBuffer).toEqualVector [0, 0]
      
    it "should store vertex index", ->
      expect(data.indexBuffer).toEqualVector [0]
      
  describe "with repeat vertex data and indices", ->
    beforeEach -> data = new Jax.Mesh.Data [1, 2, 3, 1, 2, 3], [], [], [], [0, 1]
    
    it "should store repeat vertices", ->
      expect(data.vertexBuffer).toEqualVector [1, 2, 3, 1, 2, 3]
    
    it "should store repeat index", ->
      expect(data.indexBuffer).toEqualVector [0, 1]
      
  describe "when setting color", ->
    beforeEach ->
      data = new Jax.Mesh.Data [1, 2, 3], [10, 10, 10, 10]
      data.color = "#11223344"
    
    it "should blend colors together", ->
      expect(data.colorBuffer).toEqualVector [1, 1, 2, 3]
      # expect(data.colorBuffer).toEqualVector [13, 22, 30, 39]
