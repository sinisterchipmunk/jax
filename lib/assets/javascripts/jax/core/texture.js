Jax.NORMAL_MAP = 1;

/**
 * class Jax.Texture
 * Creates a managed WebGL texture.
 **/
Jax.Texture = (function() {
  var _canvas = document.createElement('canvas');

  function imageFailed(self, image) {
    throw new Error("Texture image '"+self.image.src+"' failed to load!");
  }
  
  function isPoT(s) {
    return s && (s & -s) == s;
  }
  
  function imageLoaded(self, isImageArray, img) {
    var onload = self.options.onload || self.onload;
    
    if (!isPoT(img.width) || !isPoT(img.height)) {
      self.options.mag_filter = GL_LINEAR;
      self.options.min_filter = GL_LINEAR;
      self.options.wrap_s = GL_CLAMP_TO_EDGE;
      self.options.wrap_t = GL_CLAMP_TO_EDGE;
      self.options.generate_mipmap = false;
    }

    if (!isImageArray) {
      if (onload) onload.call(self, self.image);
      self.loaded = true;
    } else {
      self.images.load_count++;
      if (self.images.load_count == self.images.length) {
        /* all done */
        if (onload) onload.call(self, self.image);
        self.loaded = true;
      }
    }
  }
  
  function build(self, context) {
    self.handles[context.id] = context.gl.createTexture();
  }
  
  function generateTexture(context, self) {
    var data_type = self.options.data_type, format = self.options.format, target = self.options.target;
    if (self.image) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.gl.texImage2D(target, 0, format, format, data_type, self.image);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.image);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else if (self.images) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.gl.texImage2D(target, 0, format, format, data_type, self.images[0]);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_X] || self.images[0]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] || self.images[1]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] || self.images[2]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] || self.images[3]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] || self.images[4]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] || self.images[5]);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else {
      // no images at all -- load the texture with empty data; it's probably for a framebuffer
      var width = self.options.width, height = self.options.height;
      if (!width || !height) throw new Error("Can't build an empty texture without at least a width and height");
      
      function ti2d(glEnum) {
        try {
          context.gl.texImage2D(glEnum, 0, format, width, height, 0, format, data_type, null);
        } catch (e) {
          var tex = new Uint8Array(width*height*Jax.Util.sizeofFormat(format));
          context.gl.texImage2D(glEnum, 0, format, width, height, 0, format, data_type, tex);
        }
      }
      
      switch(target) {
        case GL_TEXTURE_2D:
          ti2d(GL_TEXTURE_2D);
          break;
        case GL_TEXTURE_CUBE_MAP:
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_X);
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    }
  }
  
  /* pushLevel/popLevel are used for automatic management of gl.activeTexture's.
    The general concept is that you can do something like:
    
      tex1.bind(context, function() {
        tex2.bind(context, function() {
          // render stuff.
          // tex1 => GL_TEXTURE0, tex1.textureLevel => 0
          // tex2 => GL_TEXTURE1, tex2.textureLevel => 1
          
          tex3.bind(context, 5, function() {
            // tex3 => GL_TEXTURE5, tex3.textureLevel => 5
          });
        });
      });
   */
  function pushLevel(self, level, context) {
    if (level == null) level = Jax.Texture._level++;
    self.textureLevel = level;
    self.SLOT = context.gl['TEXTURE'+level];
    context.gl.activeTexture(self.SLOT);
  }
  
  function popLevel(self, context) {
    Jax.Texture._level = self.textureLevel - 1;
    if (Jax.Texture._level < 0) Jax.Texture._level = 0;
    delete self.textureLevel;
    self.SLOT = null;
  }
  
  return Jax.Class.create({
    /**
     * new Jax.Texture(url[, options])
     * - url (String): the URL or relative path to the image to be loaded.
     * - options (Object): a generic object optionally consisting of the following properties:
     * new Jax.Texture(urls[, options])
     * - urls (Array): an array of URLs or relative paths to the images to be loaded. This is intended
     *                 for use with cube maps. If used with a cube map, 6 paths must be provided.
     *                 If used with a standard 2D texture, only the first path in the array will be used.
     * - options (Object): a generic object optionally consisting of the following properties:
     * new Jax.Texture(options)
     * - options (Object): a generic object optionally consisting of the following properties, plus a mandatory
     *                     _width_ and _height_ in pixels:
     * 
     *   * min_filter: GL_NEAREST
     *   * mag_filter: GL_NEARETS
     *   * generate_mipmap: true
     *   * mipmap_hint: GL_DONT_CARE
     *   * format: GL_RGBA
     *   * target: GL_TEXTURE_2D
     *   * data_type: GL_UNSIGNED_BYTE
     *   * wrap_s: GL_REPEAT
     *   * wrap_t: GL_REPEAT
     *   * flip_y: false
     *   * premultiply_alpha: false
     *   * colorspace_conversion: true
     *   * onload: null - a function to be called after the image has been loaded. This function
     *                    will not be called if the image fails to load.
     *                     
     * Note that WebGL support for non-power-of-two textures is very limited. If you create a WebGL
     * texture out of an image whose dimensions are not power-of-two (128, 256, 512, etc.), Jax will
     * automatically assume the following options:
     *
     *   * min_filter: GL_LINEAR
     *   * mag_filter: GL_LINEAR
     *   * wrap_s: GL_CLAMP_TO_EDGE
     *   * wrap_t: GL_CLAMP_TO_EDGE
     *   * generate_mipmap: false 
     *
     * If you replace these options with other values after initialization, WebGL will probably throw
     * an exception.
     **/
    initialize: function(path_or_array, options) {
      this.handles = {};
      this.loaded = false;
      this.valid = {};
      
      if (!options && typeof(path_or_array) == "object" && path_or_array.length == undefined) {
        options = path_or_array;
        path_or_array = options.path || null;
        delete options.path;
      }
      
      var self = this;
      this.options = options = options || {};
      options.min_filter = options.min_filter || GL_NEAREST;
      options.mag_filter = options.mag_filter || GL_NEAREST;
      options.generate_mipmap = options.generate_mipmap === undefined ? true : options.generate_mipmap;
      options.mipmap_hint = options.mipmap_hint || GL_DONT_CARE;
      options.format = options.format || GL_RGBA;
      options.target = options.target || null;
      options.data_type = options.data_type || GL_UNSIGNED_BYTE;
      options.wrap_s = options.wrap_s || GL_REPEAT;
      options.wrap_t = options.wrap_t || GL_REPEAT;
      options.flip_y = options.flip_y === undefined ? false : options.flip_y;
      options.premultiply_alpha = options.premultiply_alpha === undefined ? false : options.premultiply_alpha;
      options.colorspace_conversion = options.colorspace_conversion === undefined ? true : options.colorspace_conversion;
      options.onload = options.onload || null;
      
      var i;
      var enums = ['min_filter', 'mag_filter', 'mipmap_hint', 'format', 'target', 'data_type', 'wrap_s', 'wrap_t'];
      var global = Jax.getGlobal();
      for (i = 0; i < enums.length; i++)
        if (typeof(this.options[enums[i]]) == "string")
          this.options[enums[i]] = global[this.options[enums[i]]];

      if (path_or_array) {
        if (typeof(path_or_array) == "string") {
          this.options.target = this.options.target || GL_TEXTURE_2D;
          this.image = new Image();
          this.image.onload = function() { imageLoaded(self, false, this); };
          this.image.onerror = this.image.onabort = function() { imageFailed(self, this); };
          this.image.src = path_or_array;
        } else {
          var onload = function() { imageLoaded(self, true, this); };
          this.options.target = this.options.target || GL_TEXTURE_CUBE_MAP;
          this.images = [];
          this.images.load_count = 0;
          for (i = 0; i < path_or_array.length; i++) {
            this.images[i] = new Image();
            this.images[i].onload = onload;
            this.images[i].onerror = this.images[i].onabort = function() { imageFailed(self, this); };
            this.images[i].src = path_or_array[i];
          }
        }
      }
      else {
        // nothing to load
        this.options.target = this.options.target || GL_TEXTURE_2D;
        this.options.generate_mipmap = !!(options && options.generate_mipmap);
        this.loaded = true;
      }
    },

    getData: function() {
      if (!this.ready()) return null;
      if (this.dataBuffer) return this.dataBuffer;
      var canvas = _canvas;
      canvas.width = this.image.width;
      canvas.height = this.image.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(this.image, 0, 0);
      return this.dataBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    },
    
    /**
     * Jax.Texture#getTarget() -> GLenum
     * 
     * Returns the render target for this texture, which defaults to GL_TEXTURE_2D.
     **/
    getTarget: function() { return this.options.target; },

    /**
     * Jax.Texture#getMinFilter() -> GLenum
     * 
     * Returns the +min_filter+ for this texture, which defaults to GL_NEAREST.
     **/
    getMinFilter: function() { return this.options.min_filter; },

    /**
     * Jax.Texture#getMagFilter() -> GLenum
     * 
     * Returns the +mag_filter+ for this texture, which defaults to GL_NEAREST.
     **/
    getMagFilter: function() { return this.options.mag_filter; },

    /**
     * Jax.Texture#getGeneratesMipmaps() -> Boolean
     * 
     * Returns the +generate_mipmap+ option for this texture, which defaults to +true+.
     **/
    getGeneratesMipmaps: function() { return this.options.generate_mipmap; },

    /**
     * Jax.Texture#getMipmapHint() -> GLenum
     * 
     * Returns the +mipmap_hint+ option for this texture, which defaults to GL_DONT_CARE.
     **/
    getMipmapHint: function() { return this.options.mipmap_hint; },

    /**
     * Jax.Texture#getFormat() -> GLenum
     * 
     * Returns the +format+ option for this texture, which defaults to GL_RGBA.
     **/
    getFormat: function() { return this.options.format; },

    /**
     * Jax.Texture#getDataType() -> GLenum
     * 
     * Returns the +data_type+ option for this texture, which defaults to GL_UNSIGNED_BYTE.
     **/
    getDataType: function() { return this.options.data_type; },

    /**
     * Jax.Texture#getWrapS() -> GLenum
     * 
     * Returns the +wrap_s+ option for this texture, which defaults to GL_REPEAT.
     **/
    getWrapS: function() { return this.options.wrap_s; },

    /**
     * Jax.Texture#getWrapT() -> GLenum
     * 
     * Returns the +wrap_t+ option for this texture, which defaults to GL_REPEAT.
     **/
    getWrapT: function() { return this.options.wrap_t; },

    /**
     * Jax.Texture#getFlipY() -> Boolean
     * 
     * Returns the +flip_y+ option for this texture, which defaults to +false+.
     **/
    getFlipY: function() { return this.options.flip_y; },

    /**
     * Jax.Texture#getPremultipliesAlpha() -> Boolean
     * 
     * Returns the +premultiply_alpha+ option for this texture, which defaults to +false+.
     **/
    getPremultipliesAlpha: function() { return this.options.premultiply_alpha; },

    /**
     * Jax.Texture#getDoesColorspaceConversion() -> Boolean
     * 
     * Returns the +colorspace_conversion+ option for this texture, which defaults to +true+.
     **/
    getDoesColorspaceConversion: function() { return this.options.colorspace_conversion; },
    
    /**
     * Jax.Texture#getOnloadFunc() -> Function | null
     *
     * Returns the callback function to be called when the texture image finishes loading.
     **/
    getOnloadFunc: function() { return this.options.onload; },
    
    /**
     * Jax.Texture#refresh(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to prepare a texture handle for
     * 
     * Prepares this texture for use with the specified context. If any data has changed,
     * it will be refreshed. All options are applied at this time. Mipmaps are generated
     * if the +generate_mipmaps+ option is true.
     *
     * Call this method whenever you alter the texture data or the +Image+ associated with it.
     **/
    refresh: function(context) {
      if (!this.ready()) return;
      
      context.gl.bindTexture(this.options.target, this.getHandle(context));
      generateTexture(context, this);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_MAG_FILTER, this.options.mag_filter);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_MIN_FILTER, this.options.min_filter);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_WRAP_S, this.options.wrap_s);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_WRAP_T, this.options.wrap_t);
      context.gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.options.flip_y);
      context.gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.options.premultiply_alpha);
      context.gl.pixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, this.options.colorspace_conversion ? GL_BROWSER_DEFAULT_WEBGL : GL_NONE);
      delete this.dataBuffer;
      
      if (this.options.generate_mipmap) {
        this.generateMipmap(context);
      }
      
      context.gl.bindTexture(this.options.target, null);
      this.valid[context.id] = true;
      return this;
    },

    renderTo: function(context, options, callback) {
      if (!callback) { callback = options; options = null; }
      if (!(callback instanceof Function)) {
        alert(callback);
        throw new Error("Callback must be a function");
      }
      
      if (!this._framebuffer) {
        if (!options) options = {};
        options.colors = options.colors || [];
        options.colors.push(this);
        this._framebuffer = new Jax.Framebuffer(options);
      }
      
      this._framebuffer.bind(context);
      this._framebuffer.viewport(context);
      callback(this._framebuffer);
      this._framebuffer.unbind(context);
      context.renderer.viewport();
    },
    
    /**
     * Jax.Texture#generateMipmap(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to generate the mipmap for
     *
     * Applies the mipmap hint, if necessary, and then forcibly generates mipmaps
     * (regardless of the value of the +generate_mipmap+ option) for the given context.
     **/
    generateMipmap: function(context) {
      // FIXME why does this raise 1280 invalid enum?
      // context.gl.hint(GL_GENERATE_MIPMAP_HINT, this.options.mipmap_hint);
      context.gl.generateMipmap(this.options.target);
      return this;
    },
    
    /**
     * Jax.Texture#invalidate() -> Jax.Texture
     *
     * Invalidates this texture, which means it will be automatically refreshed (per
     * the Jax.Texture#refresh() method) the next time it is bound to any context.
     **/
    invalidate: function() { this.valid.clear(); return this; },
    
    /**
     * Jax.Texture#dispose(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to dispose of the texture for
     *
     * Disposes of the WebGL handle for the given context. Note that
     * calling Jax.Texture#bind() after disposing of it will cause the
     * texture to be regenerated, so take care not to use the texture
     * after disposing of it unless this is the intended result (e.g.
     * to dispose the texture for all contexts except for one).
     **/
    dispose: function(context) {
      delete this.dataBuffer;
      context.gl.deleteTexture(this.getHandle(context));
      delete this.handles[context.id];
    },
    
    /**
     * Jax.Texture#getHandle(context) -> WebGLTexture
     * - context (Jax.Context): the Jax context to return a handle for
     *
     * Returns the WebGL texture handle (an instance of +WebGLTexture+)
     * for the specified Jax context. If one does not exist, it will be
     * automatically allocated and returned.
     **/
    getHandle: function(context) {
      if (!this.handles[context.id]) {
        build(this, context);
        this.refresh(context);
      }
      return this.handles[context.id];
    },
    
    /**
     * Jax.Texture#isValid(context) -> Boolean
     * - context (Jax.Context): the Jax context to check validity for
     *
     * Returns true if this texture is ready for use with the specified
     * context, false otherwise. If false, the texture will be prepared
     * (per Jax.Texture#refresh()) the next time it is bound.
     **/
    isValid: function(context) {
      return !!this.valid[context.id];
    },
    
    /**
     * Jax.Texture#bind(context[, callback]) -> Jax.Texture
     * Jax.Texture#bind(context[, level, callback]) -> Jax.Texture
     * - context (Jax.Context): the Jax context to bind this texture to
     * - level (Number): the numeric level representing the nesting of this
     *                   texture within other textures. Usually, this is
     *                   managed automatically for you by Jax.Texture itself.
     * - callback (Function): an optional callback function.
     *
     * If a callback is specified, it will be called and the texture will
     * be unbound after the call has completed. Otherwise, the texture will
     * remain bound when Jax.Texture#bind returns.
     *
     * If the texture is bound within a function which contains another bound
     * texture, the +level+ will automatically be incremented. This allows Jax
     * to manage which texture slot a given texture is bound to. 
     * 
     * For example, Jax will automatically bind tex1 to GL_TEXTURE0 and tex2 to
     * GL_TEXTURE1 in the following example:
     *
     *     var tex1 = new Jax.Texture("/images/tex1.png");
     *     var tex2 = new Jax.Texture("/images/tex2.png");
     *     
     *     tex1.bind(context, function() {
     *       tex2.bind(context, function() {
     *         // context.gl.activeTexture has already been called with
     *         // the appropriate values.
     *         
     *         // you can get the active texture enums easily:
     *         // tex1.SLOT == GL_TEXTURE0
     *         // tex2.SLOT == GL_TEXTURE1
     *       });
     *     });
     *
     **/
    bind: function(context, level, callback) {
      if (!this.ready()) return; // no texture to display, yet... but not worth crashing over.
      if (!this.isValid(context)) this.refresh(context);
      
      if (typeof(level) == "number")
        pushLevel(this, level, context);
      else if (typeof(level) == "function") { callback = level; pushLevel(this, null, context); }
      
      context.gl.bindTexture(this.options.target, this.getHandle(context));
      if (callback)
      {
        callback.call(this, this.textureLevel);
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Texture#unbind(context) -> Jax.Texture
     * context (Jax.Context): the context to unbind this texture from
     *
     * Unbinds this texture form the specified context. Note that you don't need to do this
     * if you called Jax.Texture#bind() with a callback function.
     **/
    unbind: function(context) {
      if (this.textureLevel != undefined) context.gl.activeTexture(this.SLOT);
      context.gl.bindTexture(this.options.target, null);
      popLevel(this, context);
      return this;
    },
    
    /**
     * Jax.Texture#ready() -> Boolean
     * 
     * Returns true if the corresponding Image for this texture has finished loading.
     * If this texture does not have an underlying Image (e.g. it is a dynamically-generated
     * texture), then this will always return +true+.
     **/
    ready: function() {
      return this.loaded;
    }
  });
})();

Jax.Texture._level = 0;
