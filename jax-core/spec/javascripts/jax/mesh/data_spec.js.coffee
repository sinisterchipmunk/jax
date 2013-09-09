describe "Jax.Mesh.Data", ->
  data = null
  
  describe "with 4 vertices", ->
    beforeEach ->
      vertices = []
      vertices.push 1, 2, 3 for i in [0...4]
      data = new Jax.Mesh.Data vertices

    it "should use Uint8 for indices", ->
      expect(data.indexBuffer).toBeInstanceOf Uint8Array
      
  it "should refresh GL buffers when color is changed", ->
    data = new Jax.Mesh.Data [1, 2, 3]
    data.context = @context
    data.bind()
    spyOn @context.renderer, 'bufferData'
    data.color = '#f00'
    data.bind()
    expect(@context.renderer.bufferData).toHaveBeenCalled()
    
  it "should alter color buffer when color is changed", ->
    # I know, "duh", right?
    data = new Jax.Mesh.Data [1, 1, 1, 2, 2, 2, 3, 3, 3]
    data.color = [1, 0, 0, 1]
    expect(data.colorBuffer).toEqualVector([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1])

  describe "with 961 vertices", ->
    beforeEach ->
      vertices = []
      vertices.push 1, 2, 3 for i in [0...961]
      data = new Jax.Mesh.Data vertices
      
    it "should use Uint16 for indices", ->
      expect(data.indexBuffer).toBeInstanceOf Uint16Array
  
  describe "with 65537 vertices", ->
    beforeEach ->
      vertices = []
      vertices.push 1, 2, 3 for i in [0...65537]
      data = new Jax.Mesh.Data vertices

    it "should use Uint32 for indices", ->
      expect(data.indexBuffer).toBeInstanceOf Uint32Array

  describe "with only vertex data", ->
    beforeEach ->
      data = new Jax.Mesh.Data [1, 2, 3]
      
    describe "after setting color to red", ->
      beforeEach -> data.color = [1, 0, 0, 1]
      
      it "should change color buffer to red", ->
        expect(data.colorBuffer).toEqualVector [1, 0, 0, 1]
      
    it "should store vertex data", ->
      expect(data.vertexBuffer).toEqualVector [1, 2, 3]
    
    it "should default color to white", ->
      expect(data.colorBuffer).toEqualVector [1, 1, 1, 1]
      
    describe "when normals are bound", ->
      beforeEach -> data.context = @context
      
      it "should fire a shouldRecalculateNormals event", ->
        fired = false
        data.on 'shouldRecalculateNormals', -> fired = true
        data.set {}, normals: 'NORMS'
        expect(fired).toBeTrue()
        
      it "should not fire a shouldRecalculateNormals event for subsequent bindings", ->
        count = 0
        data.on 'shouldRecalculateNormals', -> count++
        data.set {}, normals: 'NORMS'
        data.set {}, normals: 'NORMS'
        data.set {}, normals: 'NORMS'
        expect(count).toEqual 1
        
    describe "when normals are not bound", ->
      beforeEach -> data.context = @context

      it "should not fire a shouldRecalculateNormals event", ->
        fired = false
        data.on 'shouldRecalculateNormals', -> fired = true
        data.set {}, vertices: 'VERTS'
        expect(fired).toBeFalse()
      
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
      # expect(data.colorBuffer).toEqualVector [1, 1, 2, 3]
      expect(data.colorBuffer).toEqualVector [170 / 255, 340 / 255, 510 / 255, 680 / 255]
