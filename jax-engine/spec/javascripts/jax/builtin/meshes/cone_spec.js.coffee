describe 'Jax.Mesh.Cone', ->
  mesh = null
  
  describe "with 4 sides", ->
    beforeEach -> mesh = new Jax.Mesh.Cone sides: 4
    
    it "should produce 7 vertices", ->
      # 1 for the point, 1 for the first vertex, 1 for each
      # side, and 1 for the final vertex
      expect(mesh.data.length).toEqual 6
    
    it "should produce proper tangents", ->
      for i in mesh.data.tangentBuffer
        expect(i).not.toBeNaN()
        