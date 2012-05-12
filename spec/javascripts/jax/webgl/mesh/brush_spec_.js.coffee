describe "Jax.Mesh.Brush", ->
  brush = null
  beforeEach -> brush = new Jax.Mesh.Brush
  
  describe "adding a single vertex", ->
    beforeEach -> brush.add_vertex 1, 2, 3
    
    it "should add the vertex to the vertex array", ->
      expect(brush.vertices).toEqualVector [1, 2, 3]
      
  describe "adding multiple vertices", ->
    beforeEach -> brush.add_vertices 1, 2, 3, 4, 5, 6
    
    it "should add all the data to the vertex array", ->
      expect(brush.vertices).toEqualVector [1, 2, 3, 4, 5, 6]
      
  describe "adding repeated vertices", ->
    beforeEach -> brush.add_vertices 1, 2, 3, 1, 2, 3
    
    it "should omit the second vertex", ->
      expect(brush.vertices).toEqualVector [1, 2, 3]
      
    it "should add the index twice", ->
      expect(brush.indices).toEqualVector [0, 0]
  
  describe "adding a single normal", ->
    beforeEach -> brush.add_normal 1, 2, 3

    it "should add the normal to the normals array", ->
      expect(brush.normals).toEqualVector [1, 2, 3]

  describe "adding multiple normals", ->
    beforeEach -> brush.add_normals 1, 2, 3, 4, 5, 6

    it "should add all the data to the normal array", ->
      expect(brush.normals).toEqualVector [1, 2, 3, 4, 5, 6]

  describe "adding repeated normals", ->
    beforeEach -> brush.add_normals 1, 2, 3, 1, 2, 3

    it "should omit the second normal", ->
      expect(brush.normals).toEqualVector [1, 2, 3]

    it "should not add any indices", ->
      # only vertices add indices
      expect(brush.indices.length).toBe 0

      describe "adding a single normal", ->
        beforeEach -> brush.add_normal 1, 2, 3

        it "should add the normal to the normals array", ->
          expect(brush.normals).toEqualVector [1, 2, 3]

  describe "adding multiple textures", ->
    beforeEach -> brush.add_textures 1, 2, 3, 4, 5, 6

    it "should add all the data to the texture array", ->
      expect(brush.textures).toEqualVector [1, 2, 3, 4, 5, 6]

  describe "adding repeated textures", ->
    beforeEach -> brush.add_textures 1, 2, 3, 1, 2, 3

    it "should omit the second texture", ->
      expect(brush.normals).toEqualVector [1, 2, 3]

    it "should not add any indices", ->
      # only vertices add indices
      expect(brush.indices.length).toBe 0
          
