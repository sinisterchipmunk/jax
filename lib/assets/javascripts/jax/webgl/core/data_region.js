//= require "jax/webgl/core/data_segment"

/**
 * class Jax.DataRegion
 *
 * Allocates a single contiguous segment of memory for storing data,
 * which is then subdivided into smaller segments as needed.
 *
 * Creating a 512-byte data region:
 *
 *     var data = new DataRegion(512);
 *
 * After a region has been created, it can be mapped to any number of
 * typed arrays.
 *
 * Mapping a 12-element Float32Array:
 *
 *     var vertices = data.map(Float32Array, 12);
 *
 * Mapping an additional 4-element Uint16Array:
 *
 *     var indices = data.map(Uint16Array, 4);
 *
 * Remapping the 12-element Float32Array into a 16-element Float32Array:
 *
 *     data.remap(vertices, 16);
 *
 * Using the arrays:
 *
 *     vertices.array[0] = 1;
 *     vertices.array[1] = vertices.array[0] + 1;
 *     indices.array[0] = 0;
 *
 **/
Jax.DataRegion = (function() {
  var CHUNK_SIZE = 1024;
  
  var klass = Jax.Class.create({
    /**
     * new Jax.DataRegion([bytes])
     * - bytes (Number): the starting number of bytes of memory to allocate
     *
     * Initializes a new Jax.DataRegion with the specified number of bytes
     * of memory.
     **/
    initialize: function(bytes) {
      this.allocate(bytes || CHUNK_SIZE);
      this.offset = 0;
      this.segments = [];
    },
    
    /**
     * Jax.DataRegion#allocate(amount) -> Jax.DataRegion
     * 
     * Ensures that the data region is large enough to contain the specified number
     * of bytes. Note that the amount is expected to include the byte offset, if any.
     **/
    allocate: function(amount) {
      if (!amount && typeof(amount) != 'number') throw new Error("amount required\n\n"+new Error().stack);
      if (isNaN(amount)) throw new Error("NaN\n\n"+new Error().stack);
      if (!this.data) {
        this.data = new ArrayBuffer(amount);
        return this;
      }
      
      var newlen = this.data.byteLength;
      if (newlen >= amount) return this;
      newlen += (parseInt(amount / CHUNK_SIZE) + 1) * CHUNK_SIZE;
      
      this.data = new ArrayBuffer(newlen);
      
      // copy segment data into new region
      // remap will also recursively remap all following segments
      if (this.segments.length > 0) {
        var buf = this.segments[0].array;
        this.remap(this.segments[0], this.segments[0].length).set(buf);
      }
      
      return this;
    },
    
    /**
     * Jax.DataRegion#map(type, length[, values]) -> Jax.DataSegment
     * Jax.DataRegion#map(type, values) -> Jax.DataSegment
     * - type (Function): the type of array to instantiate, such as Float32Array.
     * - length (Number): the number of array elements to create.
     * - values (Array): If a length is given, values is an optional array
     *                   containing values to initialize the segment with. If
     *                   the length is omitted, values becomes a required array
     *                   whose length will be used as the data segment's length.
     *
     * Creates a new segment within the data region.
     *
     * If the region does not
     * contain enough free bytes to allocate the array, a larger region will
     * be automatically allocated and all attached segments will be updated
     * to use the new data, discarding the previous. Old values will be
     * copied into the new arrays at this time.
     *
     *
     * Examples:
     *     region.map(Float32Array, 4)          //=> Float32Array [0,0,0,0]
     *     region.map(Float32Array, [1,2,3])    //=> Float32Array [1,2,3]
     *     region.map(Float32Array, 4, [1,2,3]) //=> Float32Array [1,2,3,0]
     *
     **/
    map: function(type, length, values) {
      // check for using an array of values without an explicit length
      if (typeof(length) != "number") {
        values = length;
        length = values.length;
      }

      this.allocate(this.offset + length * type.BYTES_PER_ELEMENT);
      var segment = new Jax.DataSegment(type, this.data, this.offset, length);
      this.segments.push(segment);
      segment.type = type;
      this.offset += length * type.BYTES_PER_ELEMENT;
      
      if (values) segment.set(values);
      return segment;
    },
    
    /**
     * Jax.DataRegion#remap(segment, length) -> Jax.DataSegment
     * - segment (Jax.DataSegment): the data segment to remap
     * - length (Number): the number of elements the segment should be modified to have
     *
     * Modifies the given data segment to have +length+ elements instead of the
     * number of elements it currently has. If the segment is truncated, the
     * truncated data is lost. If the segment is enlarged, the new elements will
     * be initialized to zero.
     *
     * All other segments appearing after the specified one in the memory map
     * will be altered as needed so that there is no overlapping of array data.
     * Depending on the number of segments involved, this may or may not be an
     * expensive operation.
     **/
    remap: function(segment, length, values, offset) {
      if (offset == undefined) offset = segment.byteOffset;
      if (!values && typeof(length) != 'number') {
        values = length;
        length = values.length;
      }

      var oldLength = segment.length;
      if (oldLength == length && offset == segment.byteOffset) {
        // no need to reallocate the same structure
        if (values) segment.set(values);
        return segment;
      }
      
      this.allocate(offset + length * segment.type.BYTES_PER_ELEMENT);
      
      var newAry = new segment.type(this.data, offset, length);
        if (values) { 
        try {
          newAry.set(values);
          oldLength = Math.max(values.length, oldLength);
        } catch(e) {
          throw new Error("Values are not valid: "+JSON.stringify(values));
        }
      }
      segment.setArray(newAry);
      var index = this.segments.indexOf(segment);

      // remap all following segments, and copy over their current contents
      if (index < this.segments.length-1) {
        var next = this.segments[index+1];
        var buf = next.array;
        this.remap(next, next.length, null, offset + length * segment.type.BYTES_PER_ELEMENT).set(buf);
      }
            
      // in the case of expansion (not truncation), initialize values to 0.
      // (Current values may be left over from previous segments).
      for (var i = oldLength; i < length; i++)
        segment[i] = 0;
      
      return segment;
    }
  });
  
  return klass;
})();
