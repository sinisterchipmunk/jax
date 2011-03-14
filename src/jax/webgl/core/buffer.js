/**
 * class Jax.Buffer
 *
 * Root class of all WebGL buffer objects.
 *
 * Wrapper to manage JS and GL buffer (array) types. Automates context juggling by requiring the context to generate the
 * buffer for as an argument to #bind. If the context doesn't have a corresponding GL buffer for this data, it will be
 * created. Calling #refresh will regenerate the buffer data for all contexts.
 *
 **/
Jax.Buffer = (function() {
  function each_gl_buffer(self, func)
  {
    for (var id in self.gl)
      func(self.gl[id].context, self.gl[id].buffer);
  }

  return Jax.Class.create({
    initialize: function(bufferType, classType, drawType, jsarr, itemSize) {
      if (jsarr.length == 0) throw new Error("No elements in array to be buffered!");
      if (!itemSize) throw new Error("Expected an itemSize - how many JS array elements represent a single buffered element?");
      this.classType = classType;
      this.itemSize = itemSize;
      this.js = jsarr;
      this.gl = {};
      this.numItems = this.length = jsarr.length / itemSize;
      this.bufferType = bufferType;
      this.drawType = drawType;
    },

    refresh: function() {
      var self = this;
      if (self.classTypeInstance)
        for (var i = 0; i < self.js.length; i++)
          self.classTypeInstance[i] = self.js[i];
      else
        self.classTypeInstance = new self.classType(self.js);

      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
        context.glBindBuffer(self.bufferType, buffer);
        context.glBufferData(self.bufferType, self.classTypeInstance, self.drawType);
      });
    },

    dispose: function() {
      var self = this;
      each_gl_buffer(this, function(context, buffer) {
        context.glDeleteBuffer(buffer);
        self.gl[context.id] = null;
      });
      self.gl = {};
    },

    isDisposed: function() { return !this.gl; },

    bind: function(context) { context.glBindBuffer(this.bufferType, this.getGLBuffer(context)); },

    getGLBuffer: function(context)
    {
      if (!context || typeof(context.id) == "undefined")
        throw new Error("Cannot build a buffer without a context!");

      if (!this.gl[context.id])
      {
        var buffer = context.glCreateBuffer();
        buffer.itemSize = this.itemSize;
        buffer.numItems = buffer.length = this.js.length;
        this.gl[context.id] = {context:context,buffer:buffer};
        this.refresh();
      }
      return this.gl[context.id].buffer;
    }
  });
})();

/**
 * class Jax.ElementArrayBuffer < Jax.Buffer
 *
 * A generic Int16 Array. Initialized with a standard JavaScript Array argument.
 * Its item size is 1, so each element in the array represents a separate datum,
 *
 * This type of buffer is commonly used for vertex indices, etc.
 *
 * Example:
 *     var buf = new Jax.ElementArrayBuffer([...]);
 **/
Jax.ElementArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr) {
    $super(GL_ELEMENT_ARRAY_BUFFER, Uint16Array, GL_STREAM_DRAW, jsarr, 1);
  }
});

/**
 * class Jax.FloatArrayBuffer < Jax.Buffer
 *
 * A generic Float Array. Initialized with a standard JavaScript Array argument,
 * and an item size. As the item size represents how many array elements represent
 * a single datum, the array must be divisible by this number.
 *
 * Unless you're implementing something Jax does not support by default, you're
 * most likely looking for one of the subclasses of Jax.FloatArrayBuffer.
 *
 * Example:
 *     var buf = new Jax.FloatArrayBuffer([...], 3);
 **/
Jax.FloatArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr, itemSize) {
    $super(GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, jsarr, itemSize);
  }
});

/**
 * class Jax.VertexBuffer < Jax.FloatArrayBuffer
 *
 * Initialized with a standard JavaScript Array argument.
 *
 * Example:
 *     var buf = new Jax.VertexBuffer([...]);
 **/
Jax.VertexBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});

/**
 * class Jax.ColorBuffer < Jax.FloatArrayBuffer
 *
 * Initialized with a standard JavaScript Array argument.
 *
 * Example:
 *     var buf = new Jax.ColorBuffer([...]);
 **/
Jax.ColorBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 4); }
});

/**
 * class Jax.TextureCoordsBuffer < Jax.FloatArrayBuffer
 *
 * Initialized with a standard JavaScript Array argument.
 *
 * Example:
 *     var buf = new Jax.TextureCoordsBuffer([...]);
 **/
Jax.TextureCoordsBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 2); }
});

/**
 * class Jax.NormalBuffer < Jax.FloatArrayBuffer
 *
 * Initialized with a standard JavaScript Array argument.
 *
 * Example:
 *     var buf = new Jax.NormalBuffer([...]);
 **/
Jax.NormalBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});
