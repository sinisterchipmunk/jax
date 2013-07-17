describe "Jax.Mesh.PLY.Parser", ->
  ply = null
  describe "parsing binary 1.0", ->
    beforeEach -> ply = new Jax.Mesh.PLY.Parser 'ply\nformat binary_big_endian 1.0\ncomment author: Paraform\nobj_info 3D colored patch boundaries \nelement vertex 1\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty uchar intensity\nproperty list uchar int vertex_indices\nend_header\n@\xBC\xA0aA<\x9DJA\xDAD\u0013\x99\x03\x00\x00\x00\x01\x00\x00\x00\x02\x00\x00\x00\x03'
    it "should parse ok", ->
      expect(ply.vertex[0]).toEqual x: 5.894577503204346, y: 11.788400650024414, z: 27.283239364624023
      expect(ply.face[0].vertex_indices).toEqual [1, 2, 3]
      expect(ply.face[0].intensity).toEqual 0x99
    
  it "stringToBytes", ->
    stb = Jax.Mesh.PLY.Parser.prototype.stringToBytes
    expect(stb.call(Jax.Mesh.PLY.Parser.prototype, 'a')).toEqual [97]
    expect(stb.call(Jax.Mesh.PLY.Parser.prototype, '@\xBC\xA0aA<\x9DJA\xDAD\u0013\xC2UL\xEAB\x865o\xC2e\xCC\xEF@p\b\u0002A\x84\v\u0010A\xEB')).toEqual(
      [64, 188, 160, 97, 65, 60, 157, 74, 65, 218, 68, 19, 194,
       85, 76, 234, 66, 134, 53, 111, 194, 101, 204, 239, 64,
       112, 8, 2, 65, 132, 11, 16, 65, 235]
    )
    
  it "readBinaryValue", ->
    rbv = Jax.Mesh.PLY.Parser.prototype.readBinaryValue
    bytes = [64, 188, 160, 97]
    expect(rbv.call(Jax.Mesh.PLY.Parser.prototype, bytes, 'float', 1)).toEqual(5.894577503204346)
  
  describe "parsing ASCII 1.0", ->
    beforeEach -> ply = new Jax.Mesh.PLY.Parser """
    ply
    format ascii 1.0
    comment made by Greg Turk
    comment this file is a cube
    element vertex 8
    property float x
    property float y
    property float z
    element face 6
    property list uchar int vertex_index
    end_header
    0 0 0
    0 0 1
    0 1 1
    0 1 0
    1 0 0
    1 0 1
    1 1 1
    1 1 0
    4 0 1 2 3
    4 7 6 5 4
    4 0 4 5 1
    4 1 5 6 2
    4 2 6 7 3
    4 3 7 4 0
    """
    
    it "should find the format", -> expect(ply.format).toEqual 'ascii'
    it "should find the version", -> expect(ply.version).toEqual '1.0'
    it "should find both comments, in order", ->
      expect(ply.comments).toEqual ['made by Greg Turk', 'this file is a cube']
    it "should find 8 vertices", -> expect(ply.vertex.length).toEqual 8
    it "should find 6 faces", -> expect(ply.face.length).toEqual 6
    it "should detect the vertices in order", ->
      expect(ply.vertex[0]).toEqual x: 0, y: 0, z: 0
      expect(ply.vertex[1]).toEqual x: 0, y: 0, z: 1
      expect(ply.vertex[2]).toEqual x: 0, y: 1, z: 1
      expect(ply.vertex[3]).toEqual x: 0, y: 1, z: 0
      expect(ply.vertex[4]).toEqual x: 1, y: 0, z: 0
      expect(ply.vertex[5]).toEqual x: 1, y: 0, z: 1
      expect(ply.vertex[6]).toEqual x: 1, y: 1, z: 1
      expect(ply.vertex[7]).toEqual x: 1, y: 1, z: 0
    it "should detect the vertex indices for each face in order", ->
      expect(ply.face[0].vertex_index).toEqual [0, 1, 2, 3]
      expect(ply.face[1].vertex_index).toEqual [7, 6, 5, 4]
      expect(ply.face[2].vertex_index).toEqual [0, 4, 5, 1]
      expect(ply.face[3].vertex_index).toEqual [1, 5, 6, 2]
      expect(ply.face[4].vertex_index).toEqual [2, 6, 7, 3]
      expect(ply.face[5].vertex_index).toEqual [3, 7, 4, 0]
      