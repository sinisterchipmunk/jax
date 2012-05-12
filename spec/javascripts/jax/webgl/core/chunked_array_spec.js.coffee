describe "Jax.ChunkedArray", ->
  data = null
  beforeEach ->
    data = new Jax.ChunkedArray Float32Array
    
  it "should cache subdivisions", ->
    data.array 8
    expect(data.subdivide 4).toBe(data.subdivide 4)
    
  describe "reallocating", ->
    it "should bust the subdivision cache", ->
      data.array 8
      old = data.subdivide 4
      data.array 4
      expect(data.subdivide 4).not.toBe old
    
  it "should not lose data over the course of many pushes", ->
    for i in [0...512]
      data.push 1, 1, 1, 1
    for i in [0...2048]
      expect(data.raw[i]).toEqual 1
      return if i == 0
      
  it "should not truncate data over the course of many pushes", ->
    for i in [0...256]
      data.push 1, 1, 1, 1
    expect(data.length).toEqual 1024
    
  it "should expose the raw typed array", ->
    expect(data.raw instanceof Float32Array).toBeTruthy()
    
  it "should have a length", ->
    expect(data.length).toBe 0
    
  it "should increment length", ->
    data.push 1, 2, 3
    expect(data.length).toBe 3
    
  it "should update the length", ->
    data.array(1)
    expect(data.length).toBe 1
    data.array(3)
    expect(data.length).toBe 3
    data.array(2)
    expect(data.length).toBe 2
    
  it "should create the specified array", ->
    expect(data.array(3)).toEqualVector [0, 0, 0]
  
  it "should not lose values when creating a larger copy", ->
    x = data.array(1)
    x[0] = 1
    expect(data.array(2)).toEqualVector [1, 0]
  
  it "should extend array when elements are pushed", ->
    x = data.array(1)
    x[0] = 1
    x = data.push(2, 3)
    expect(x).toEqualVector [1, 2, 3]
    
  it "should subdivide the existing array", ->
    x = data.array(6)
    y = data.subdivide 3
    expect(y.length).toEqual 2
    expect(y[0]).toEqualVector [0, 0, 0]
    expect(y[1]).toEqualVector [0, 0, 0]
    
  it "should not lose data while subdividing the array", ->
    x = data.array(6)
    x[0] = 1
    x[5] = 2
    y = data.subdivide 3
    expect(y.length).toEqual 2
    expect(y[0]).toEqualVector [1, 0, 0]
    expect(y[1]).toEqualVector [0, 0, 2]
    
  it "should reflect updates to data across divisions", ->
    x = data.array(6)
    y = data.subdivide 3
    z = data.subdivide 2
    y[0][0] = 1
    expect(z[0][0]).toEqual 1
