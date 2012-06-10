describe "Jax.Mesh.Triangles", ->
  mesh = material = null
  
  describe "with more than 65535 vertices", ->
    beforeEach -> mesh = new Jax.Mesh.Triangles(init: (v) -> v.push i for i in [0...(65535*3+9)])
    
    it "should produce a Triangles sub-mesh", ->
      expect(mesh.submesh).toBeInstanceOf Jax.Mesh.Triangles
    
    it "should not have more than 65535 vertices", ->
      expect(mesh.data.vertexBuffer.length).not.toBeGreaterThan 65535*3
      
    it "should not reference higher vertex indices", ->
      for i in mesh.data.indexBuffer
        expect(i).not.toBeGreaterThan 65535
        
    it "should have a sub-mesh with vertices", ->
      expect(mesh.submesh.data.vertexBuffer.length).not.toEqual 0
      
  beforeEach ->
    mesh = new Jax.Mesh.Triangles init: (v, c, t, n) ->
      v.push -1,1,0,  -1,-1,0,  1,1,0
      t.push 0,1,      0,0,     1,1
      n.push 0,0,1,    0,0,1,   0,0,1

  it "should calculate correct normals", ->
    mesh.recalculateNormals()
    expect(mesh.data.normalBuffer).toEqualVector [0, 0, 1, 0, 0, 1, 0, 0, 1]
    
  it "should calculate correct tangents", ->
    mesh.recalculateTangents()
    expect(mesh.data.tangentBuffer).toEqualVector [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]
    
  it "should calculate correct bitangents", ->
    mesh.recalculateBitangents()
    expect(mesh.data.bitangentBuffer).toEqualVector [0, 1, 0, 0, 1, 0, 0, 1, 0]

  it "should be rendered as GL_TRIANGLES", ->
    mat = new Jax.Material
    mat.render = (context, _mesh, options) ->
      # after all that setup, here's the real test...
      expect(_mesh.draw_mode).toEqual GL_TRIANGLES
    spyOn(mat, 'render').andCallThrough()
    mesh.render "context", "model", mat
    expect(mat.render).toHaveBeenCalled()

