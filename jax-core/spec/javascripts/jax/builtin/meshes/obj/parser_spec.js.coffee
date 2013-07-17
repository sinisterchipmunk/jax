describe "Jax.Mesh.OBJ.Parser", ->
  describe "with smooth faces calculated", ->
    beforeEach ->
      @parser = new Jax.Mesh.OBJ.Parser """
        o Plane
        v 1.000000 0.586170 1.000000
        v -1.000000 0.000000 1.000000
        v -1.000000 0.586170 -1.000000
        v 1.000000 0.000000 -1.000000
        vn 0.270749 0.923791 -0.270749
        vn -0.270749 0.923791 0.270749
        s 1
        f 1//1 4//1 3//1
        f 1//2 3//2 2//2
      """

    it 'should match smooth faces precalculated', ->
      p2 = new Jax.Mesh.OBJ.Parser """
        o Plane
        v 1.000000 0.586170 1.000000
        v -1.000000 0.000000 1.000000
        v -1.000000 0.586170 -1.000000
        v 1.000000 0.000000 -1.000000
        vn 0.000000 1.000000 0.000000
        vn 0.270730 0.923765 -0.270730
        vn -0.270730 0.923765 0.270730
        s 1
        f 1//1 4//2 3//1
        f 1//1 3//1 2//3
      """
      [fa, fb] = [@parser.objects['Plane'].faces, p2.objects['Plane'].faces]
      expect(fa[0].n[0]).toEqualVector fb[0].n[0]
      expect(fa[0].n[1]).toEqualVector fb[0].n[1]
      expect(fa[0].n[2]).toEqualVector fb[0].n[2]
      expect(fa[1].n[0]).toEqualVector fb[1].n[0]
      expect(fa[1].n[1]).toEqualVector fb[1].n[1]
      expect(fa[1].n[2]).toEqualVector fb[1].n[2]

  describe "with flat faces", ->
    beforeEach ->
      @parser = new Jax.Mesh.OBJ.Parser """
        o Plane
        v 1.000000 0.586170 1.000000
        v -1.000000 0.000000 1.000000
        v -1.000000 0.586170 -1.000000
        v 1.000000 0.000000 -1.000000
        vn 0.270749 0.923791 -0.270749
        vn -0.270749 0.923791 0.270749
        s off
        f 1//1 4//1 3//1
        f 1//2 3//2 2//2
      """

  describe "with a bunch of test data", ->
    beforeEach ->
      @parser = new Jax.Mesh.OBJ.Parser """
        # This is a comment
        o Monkey # another comment
        v 1 2 3
        v 2 3 4
        v 3 4 5
        v 4 5 6
        vt 0 0
        vt 0 1
        vt 1 0
        vt 1 1
        vn 0 1 0
        vn 0 0 1
        vn 1 0 0
        vn 1 1 1
        s 0
        f 1/1/1 2/2/2 3/3/3
        f 1/1/1 2/2/2 3/3/3 4/4/4
        f 3/2/1 1/2/3 1/3/2
        f 1// 2/1/2 3//
      """

    it 'should create an object called Monkey', ->
      expect(@parser.objects['Monkey']).not.toBeUndefined()

    it 'should store face data', ->
      # I had planned to store indices much like the file format itself,
      # but it makes more sense to store the raw data so that we can aggregate
      # normals for smooth faces and that sort of thing.
      expect(@parser.objects['Monkey'].faces).toEqual [
        {
          v: [ [1, 2, 3], [2, 3, 4], [3, 4, 5] ]
          t: [ [0, 0], [0, 1], [1, 0] ]
          n: [ [0, 1, 0], [0, 0, 1], [1, 0, 0] ]
        }, {
          v: [ [1, 2, 3], [2, 3, 4], [3, 4, 5] ]
          t: [ [0, 0], [0, 1], [1, 0] ]
          n: [ [0, 1, 0], [0, 0, 1], [1, 0, 0] ]
        }, {
          v: [ [1, 2, 3], [3, 4, 5], [4, 5, 6] ]
          t: [ [0, 0], [1, 0], [1, 1] ]
          n: [ [0, 1, 0], [1, 0, 0], vec3.normalize([], [1, 1, 1]) ]
        }, {
          v: [ [3, 4, 5], [1, 2, 3], [1, 2, 3] ]
          t: [ [0, 1], [0, 1], [1, 0] ]
          n: [ [0, 1, 0], [1, 0, 0], [0, 0, 1] ]
        }, {
          v: [ [1, 2, 3], [2, 3, 4], [3, 4, 5] ]
          t: [ undefined, [0, 0], undefined ]
          n: [ undefined, [0, 0, 1], undefined ]
        }
      ]

    it 'should parse vertex data', ->
      expect(@parser.objects['Monkey'].vertices).toEqual [
        [ 1, 2, 3 ],
        [ 2, 3, 4 ],
        [ 3, 4, 5 ],
        [ 4, 5, 6 ]
      ]

    it 'should parse normal data', ->
      expect(@parser.objects['Monkey'].normals).toEqual [
        [ 0, 1, 0 ],
        [ 0, 0, 1 ],
        [ 1, 0, 0 ],
        vec3.normalize([], [1, 1, 1])
      ]

    it 'should parse texture coords data', ->
      expect(@parser.objects['Monkey'].textureCoords).toEqual [
        [ 0, 0 ],
        [ 0, 1 ],
        [ 1, 0 ],
        [ 1, 1 ]
      ]

