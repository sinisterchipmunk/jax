global.ArrayBuffer = function(size) {
  this.byteLength = size;
};

function TypedArray() {
  // length or array or ArrayBuffer
  if (typeof(arguments[0]) == 'number') this.buffer = new Array(arguments[0]);
  else this.buffer = arguments[0];
  
  this.byteOffset = arguments[1] || 0;
  this.length = arguments[2] || this.buffer.byteLength / this.BYTES_PER_ELEMENT;
  this.byteLength = this.length * this.BYTES_PER_ELEMENT;
  
  this.set = function(ary, ofs) {
    ofs = ofs || 0;
    for (var i = 0; i < ary.length; i++) {
      this[i+ofs] = ary[i];
    }
  };
  
  this.subarray = function(start, end) {
    return new this.type(this.buffer,
                         this.byteOffset + start * this.BYTES_PER_ELEMENT,
                         end - start);
  };

  var self = this;
  for (var i = 0; i < this.length; i++)
    Object.defineProperty(this, i, (function() {
      var j = i;
      return {
        configurable: true,
        enumerable: true,
        get: function()  { return self.buffer[j + (self.byteOffset / self.BYTES_PER_ELEMENT)]; },
        set: function(v) { return self.buffer[j + (self.byteOffset / self.BYTES_PER_ELEMENT)] = v; }
      }
    })());
};

function defineTypedArray(bytesPerElement) {
  var bpe = bytesPerElement;
  var type = function() {
    var b = bpe;
    this.BYTES_PER_ELEMENT = b;
    TypedArray.apply(this, arguments);
  };
  type.prototype.type = type;
  type.BYTES_PER_ELEMENT = bpe;
  return type;
}

global.Int8Array = defineTypedArray(1);
global.Uint8Array = defineTypedArray(1);
global.Int16Array = defineTypedArray(2);
global.Uint16Array = defineTypedArray(2);
global.Int32Array = defineTypedArray(4);
global.Uint32Array = defineTypedArray(4);
global.Float32Array = defineTypedArray(4);
global.Float32Array = defineTypedArray(8);
