/**
 * class Jax.DataSegment
 *
 * Returned by the mapping functions in +Jax.DataRegion+, Jax.DataSegment wraps
 * around the typed arrays maintained by that class. It is intended to look
 * and feel just like the underlying object and you can use it as such.
 *
 * The purpose of Jax.DataSegment is to provide a handle to the data segments
 * maintained by Jax.DataRegion, because the underlying typed arrays may be
 * reinitialized at any time as the data region itself is adjusted.
 *
 * You can also create data "groups" to further organize the data.
 * An example would be to group a Float32Array into sets of 3
 * for use as (X, Y, Z) vertex information:
 *
 *     var vertexData = new Jax.DataSegment(Float32Array, [0,1,0,  -1,0,0,  1,0,0]);
 *     var vertices = vertexData.group(3);
 *     for (var i = 0; i < vertices.length; i++) {
 *       var vertex = vertices[i].array;
 *       var x = vertex[0], y = vertex[1], z = vertex[2];
 *       // . . .
 *     }
 *
 **/
Jax.DataSegment = (function() {
  function populateGroup(self, group, size) {
    var i, j, bytes = self.type.BYTES_PER_ELEMENT, len = 0, buf;
    for (i = 0; i < self.array.length; i += size) {
      if (buf = group[len]) {
        // update existing group
        buf.setArray(new self.type(self.buffer, self.byteOffset + i*bytes, size));
      }
      else {
        // create new group
        buf = new Jax.DataSegment(self.type, self.buffer, self.byteOffset + i*bytes, size);
        group.push(buf);
      }
      len++;
    }
    // remove any groups remaining after data truncation
    while (group.length > len) group.pop();
  }
  
  var klass = Jax.Class.create({
    /**
     * new Jax.DataSegment(type, buffer, byteOffset, length)
     * - type (Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array): the typed array type
     * - buffer (ArrayBuffer): the array buffer containing at least enough bytes to contain this data segment
     * - byteOffset (Number): the offset into the ArrayBuffer of the first byte of this segment
     * - length (Number): the length in elements (not bytes) of this segment
     *
     * This class is not intended to be instantiated directly, although there's
     * nothing technically keeping you from doing so. It is preferred that you
     * make use of +Jax.DataRegion+.
     *
     **/
    initialize: function(type, buffer, byteOffset, length) {
      this.type = type;
      this.groups = [];
      try {
        if (arguments.length == 2)
          if (buffer instanceof this.type) this.setArray(buffer);
          else this.setArray(new type(buffer));
        else if (arguments.length == 1)
          this.setArray(type);
        else
          this.setArray(new type(buffer, byteOffset, length));
      } catch(e) {
        throw new Error("Error: "+e+" while constructing segment from "+
                        "("+type+", "+buffer+"["+buffer.byteLength+"], "+byteOffset+", "+length+")");
      }
    },
    
    /**
     * Jax.DataSegment#setArray(buf) -> Jax.DataSegment
     * - buf (Array): The array whose values to assign. Can be any array or enumeration
     *                compatible with the #set method exposed by the Typed Arrays specification.
     *
     * Assigns the given buffer to the +array+ property of this data segment. Note that this
     * assumes the reference of the given buffer; that is, further changes to the buffer will
     * be reflected directly within this data segment and any data groups attached to it.
     *
     * Returns this data segment.
     **/
    setArray: function(buf) {
      // if (this.length)
      //   for (var i = 0; i < this.length; i++)
      //     delete this[i];
      
      /**
       * Jax.DataSegment#array -> Array
       * the underlying typed array which contains the segment data.
       **/
      this.array  = buf;
      
      /**
       * Jax.DataSegment#length -> Number
       * the length of the underlying typed array in elements. This property
       * can only be changed via a call to +Jax.DataSegment#setArray+.
       **/
      this.length = buf.length;
      
      /**
       * Jax.DataSegment#buffer -> ArrayBuffer
       * the underlying raw data buffer
       **/
      this.buffer = buf.buffer;
      
      /**
       * Jax.DataSegment#byteOffset -> Number
       * the offset in bytes into the +buffer+ at which this data segment begins
       **/
      this.byteOffset = buf.byteOffset;
      
      /**
       * Jax.DataSegment#byteLength -> Number
       * the number of bytes in the +buffer+ that this data segment contains
       **/
      this.byteLength = buf.byteLength;
      
      // define index setters/getters
      // var self = this;
      // for (var i = 0; i < buf.length; i++) {
      //   Object.defineProperty(self, i, (function() {
      //     var j = i;
      //     return {
      //       configurable: true,
      //       enumerable: true,
      //       get: function()  { return self.array[j]; },
      //       set: function(v) { return self.array[j] = v; }
      //     }
      //   })());
      // }
      
      // update groups
      for (var i = 0; i < this.groups.length; i++) {
        var group = this.groups[i];
        if (group.length > 0) {
          var size = group.size || group[0].length;
          populateGroup(this, group, size);
        }
      }
      
      return this;
    },
    
    /**
     * Jax.DataSegment#group(size) -> Array<Jax.DataSegment>
     * - size (Number): the size, in array elements, of each group
     *
     * Creates a new view of this array laid out in the form of a 2D array.
     * Each top-level element of the group contains a new instance of +Jax.DataSegment+,
     * which in turn contains an +array+ property of exactly +size+ elements.
     *
     * This is useful for organizing a data segment into a more convenient structure,
     * for instance, grouping a raw set of Float values into 3-dimensional Vertices:
     *
     *     var segment = region.map(Float32Array, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
     *     var vertices = segment.group(3);
     *     //=> vertices now contains 3 segments containing 3 floats each
     *     
     *     for (var i = 0; i < vertices.length; i++) {
     *       var vertex = vertices[i].array;
     *       var x = vertices[0], y = vertices[1], z = vertices[2];
     *       // . . .
     *     }
     *
     * The group still points to the same physical memory as the segment it is
     * derived from; therefore, changes to the parent segment will be immediately
     * reflected within the group.
     *
     * The number of elements in the parent segment must be divisible by +size+. Otherwise,
     * an error is raised.
     **/
    group: function(size) {
      if (this.array.length % size != 0)
        throw new Error("Data segment size "+this.array.length+" is not divisible by group size "+size);
      var self = this;
      var group = {
        length: 0,
        push: function(seg) { this[this.length] = seg; this.length++; return seg; },
        pop: function() { this.length--; var ret = this[this.length]; delete this[this.length]; return ret; },
        getRawData: function() { return self; },
        size: size,
        type: self.type
      };
      populateGroup(this, group, size);
      this.groups.push(group);
      return group;
    },
    
    /**
     * Jax.DataSegment#removeGroup(group) -> Jax.DataSegment
     * - group (Jax.DataSegment): the group to be removed
     *
     * See +Jax.DataSegment#group+.
     *
     * When a group is created, its parent segment maintains a handle to it. This way,
     * if the underlying array belonging to the parent segment is replaced with a
     * completely different array (a common occurrance when a Jax.DataRegion needs
     * to reallocate a new block of memory), the parent segment can notify its groups
     * that their arrays, in turn, must also be replaced.
     *
     * This has the unfortunate side effect of maintaining a reference to the group
     * even after it has outlived its usefulness. If you are done using a group,
     * the JavaScript garbage collector cannot recapture the group unless you first
     * remove it from its parent data segment.
     *
     * After the removal, this data segment is returned.
     **/
    removeGroup: function(group) {
      var index;
      if (typeof(group) == 'number') index = group;
      else index = this.groups.indexOf(group);
      
      if (index != -1)
        this.groups.splice(index, 1);
      return this;
    },
    
    /**
     * Jax.DataSegment#set(array[, offset]) -> void
     * - array (Array): any enumerable or array that is compatible with the Typed Arrays specification
     * - offset (Number): an optional offset, in elements, into this data segment to begin copying the array
     *
     * Copies the data from +array+ into the +array+ property of this data segment, per the
     * Typed Arrays specification.
     **/
    set: function(i, v) {
      this.array.set.apply(this.array, arguments);
    },
    
    /**
     * Jax.DataSegment#subarray(begin, end) -> Jax.DataSegment
     * - begin (Number): the start of the subarray, inclusive
     * - end (Number): the end of the subarray, exclusive
     *
     * Constructs a new data segment from a subarray of this data segment with the specified range.
     * This is effectively similar to calling the +subarray+ method of a typed array.
     *
     **/
    subarray: function(begin, end) {
      return new Jax.DataSegment(this.type, this.array.subarray(begin, end));
    },
    
    toString: function() {
      return "{array:"+this.array.toString()+"}";
    }
  });
  
  return klass;
})();
