/**
 * class Jax.Buffer
 *
 * Root class of all WebGL buffer objects.
 *
 * Wrapper to manage JS and GL buffer (array) types. Automates context
 * juggling by requiring the context to generate the buffer for as an
 * argument to #bind. If the context doesn't have a corresponding GL
 * buffer for this data, it will be created. Calling #refresh will
 * regenerate the buffer data for all contexts.
 *
 **/
Jax.Buffer = (function() {
  function each_gl_buffer(self, func)
  {
    for (var id in self.gl)
      func(self.gl[id].context, self.gl[id].buffer);
  }

  /**
   * new Jax.Buffer(bufferType, classType, drawType, jsarr, itemSize)
   * - bufferType (GLenum): A WebGL enumeration specifying what type
   *                        of buffer this represents, such as GL_ELEMENT_ARRAY_BUFFER or
   *                        GL_ARRAY_BUFFER.
   * - classType (TypedArray): a typed array to implement this buffer
   * with, such as +Uint6Array+ or +Float32Array+.
   * - drawType (GLenum): GL_STREAM_DRAW, GL_STATIC_DRAW, or GL_DYNAMIC_DRAW.
   * - jsarr (Array): a JavaScript Array containing the actual raw
   * data. This should be a flat array (that is, no nested arrays).
   * - itemSize (Number): the number of items in a single element
   * of the buffer. The length of the buffer must be divisible by
   * this number.
   *
   **/
  function Buffer(bufferType, deprecated, drawType, jsarr, itemSize, dataType) {
    // if (jsarr.length == 0) throw new Error("No elements in array to be buffered!");
    if (!itemSize) throw new Error("Expected an itemSize - how many JS array elements represent a single buffered element?");
    this.itemSize = itemSize;
    this.js = jsarr;
    this.gl = {};
    this.numItems = this.length = jsarr.length / itemSize;
    this.bufferType = bufferType;
    this.drawType = drawType;
    if (dataType) this.dataType = dataType;
    else
      if (jsarr instanceof Float32Array) this.dataType = GL_FLOAT;
      if (jsarr instanceof Uint8Array)   this.dataType = GL_UNSIGNED_BYTE;
      if (jsarr instanceof Uint16Array)  this.dataType = GL_UNSIGNED_SHORT;
      if (jsarr instanceof Uint32Array)  this.dataType = GL_UNSIGNED_INT;
    if (!this.dataType) throw new Error("Couldn't detect dataType");
  }

  jQuery.extend(Buffer.prototype, {

    /**
     * Jax.Buffer#refresh() -> Jax.Buffer
     *
     * Causes Jax to immediately refresh the buffer data on the graphics card
     * for all WebGL contexts the buffer is bound to. This should be done any
     * time you change the data within the buffer's underlying JavaScript array.
     **/
    refresh: function() {
      var self = this;
      var instance = this.refreshTypedArray();
      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
        context.renderer.bindBuffer(self.bufferType, buffer);
        context.renderer.bufferData(self.bufferType, instance, self.drawType);
      });
      
      return this;
    },
    
    /**
     * Jax.Buffer#refreshTypedArray() -> TypedArray
     *
     * Refreshes the contents of the buffer's typed array and then returns
     * the typed array itself. This does not cause the corresponding GL
     * buffers to be refreshed.
     **/
    refreshTypedArray: function() {
      var self = this;
      var instance = this.js;//getTypedArray();
      // instance.set(self.js);

      self.numItems = self.length = self.js.length / self.itemSize;
      return instance;
    },
    
    /**
     * Jax.Buffer#getTypedArray([defaultValues]) -> TypedArray
     *
     * Returns the typed array instance corresponding for this buffer.
     **/
    // getTypedArray: function() {
    //   return this.classTypeInstance = this.classTypeInstance || new this.classType(this.js);
    // },

    /**
     * Jax.Buffer#dispose() -> Jax.Buffer
     *
     * Dispose of this buffer's WebGL counterparts. This is applied to all contexts
     * the buffer is associated with.
     *
     * Note that calling Jax.Buffer#bind will rebuild this buffer, effectively
     * cancelling this method out, so take care not to use the buffer after
     * disposing it unless this is the functionality you want (e.g. to clean up
     * some Jax contexts, but not all of them).
     **/
    dispose: function() {
      var self = this;
      each_gl_buffer(this, function(context, buffer) {
        context.renderer.deleteBuffer(buffer);
        self.gl[context.id] = null;
      });
      self.gl = {};
      return self;
    },

    /**
     * Jax.Buffer#isDisposed() -> Boolean
     * 
     * Returns true if this buffer is in an uninitialized state.
     **/
    isDisposed: function() { return !this.gl; },

    /**
     * Jax.Buffer#bind(context) -> Jax.Buffer
     * - context (Jax.Context): the context to bind the buffer to.
     *
     * Binds this buffer to the specified context, then returns the buffer.
     * If this buffer is in an uninitialized or disposed state, it will be
     * built (or rebuilt) prior to binding.
     **/
    bind: function(context) { context.renderer.bindBuffer(this.bufferType, this.getGLBuffer(context)); return this; },

    /**
     * Jax.Buffer#getGLBuffer(context) -> WebGLBuffer
     * - context (Jax.Context): the context to get the buffer for.
     * 
     * Returns the underlying WebGLBuffer instance representing this buffer's data
     * for the specified context. Note that this is different for each context.
     * If the buffer has not yet been defined for the given context, it will be.
     **/
    getGLBuffer: function(context)
    {
      if (!context || typeof(context.id) == "undefined")
        throw new Error("Cannot build a buffer without a context!");

      if (!this.gl[context.id])
      {
        var buffer = context.renderer.createBuffer();
        buffer.itemSize = this.itemSize;
        this.gl[context.id] = {context:context,buffer:buffer};
        this.refresh();
      }
      return this.gl[context.id].buffer;
    }
  });

  return Buffer;
})();
