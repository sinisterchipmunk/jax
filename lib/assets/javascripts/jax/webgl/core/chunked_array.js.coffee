###
Provides an interface to manage a typed array by wrapping an `ArrayBuffer` instance.
You can use `ChunkedArray` to dynamically re-allocate typed arrays as needed, which
is helpful when you don't initially know the size of the data you will require.

This is not meant to be used for temporary objects. `ChunkedArray` is very wasteful
in the early stages of its life and is meant to be reused over long periods of time
instead of thrown away shortly after instantiation. For example, it can be used to
store mesh data long-term, but it would be a horrible choice for performing
mathematical calculations against.

Usage example:

    data = new ChunkedArray Float32Array
    vertices = data.array 3
    vertices instanceof Float32Array
    #=> true
    
    vertices[0] = 1
    vertices[1] = 2
    vertices[3] = 3
    
    # Now we need to resize vertices to 6 elements
    vertices = data.array 6
    #=> [1, 2, 3, 0, 0, 0]
    
To make it easier to push values into the array, you can call the #push method directly
on the `ChunkedArray`:

    data = new ChunkedArray Float32Array
    vertices = data.push 0, 1, 2
    #=> [0, 1, 2]
    vertices = data.push 3, 4, 5
    #=> [0, 1, 2, 3, 4, 5]
    
For easier management, you can also subdivide the array into a 2D array view:

    data = new ChunkedArray Float32Array
    raw_vertices = data.push 0, 1, 2, 3, 4, 5
    vectors = data.subdivide 3
    #=> [ [0, 1, 2], [3, 4, 5] ]

    vectors[0][1] = 10
    #=> [ [0, 10, 2], [3, 4, 5] ]
    
    raw_vertices
    #=> [ 0, 10, 2, 3, 4, 5 ]

###
class Jax.ChunkedArray
  CHUNK_SIZE = 1024
  
  constructor: (@type) ->
    @chunks = 0
    @data = new ArrayBuffer 0
    @raw = new @type @data, 0, 0
    @subdivisions = {}
    @length = 0
  
  array: (required_size) ->
    return @raw if required_size == @raw.length
    required_size_bytes = required_size * @type.BYTES_PER_ELEMENT
    copyData = false
    if required_size_bytes > @data.byteLength
      new_length = @data.byteLength
      new_length += CHUNK_SIZE while new_length <= required_size_bytes
      new_data = new ArrayBuffer new_length
      copyData = true
      @data = new_data
    @subdivisions = {} unless required_size_bytes == @data.byteLength
    @length = required_size
    new_raw = new @type @data, 0, required_size
    if copyData
      for i in [0...@raw.length]
        break if i >= new_raw.length
        new_raw[i] = @raw[i]
    @raw = new_raw

  push: () ->
    offset = @raw.length
    required_size = offset + arguments.length
    ary = @array required_size
    for i in [0...arguments.length]
      ary[offset+i] = arguments[i]
    return ary

  subdivide: (size, required_size = @raw.length) ->
    @array required_size
    return @subdivisions[size] if @subdivisions[size]
    @subdivisions[size] = for i in [0...@raw.length] by size
      new @type @data, i * @type.BYTES_PER_ELEMENT, size
    