/**
 * class Jax.Texture
 * Creates a managed WebGL texture.
 **/
Jax.Texture = (function() {
  function imageLoaded(self, isImageArray) {
    var onload = self.options.onload || self.onload;

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
    self.handles[context.id] = context.glCreateTexture();
  }
  
  function generateTexture(context, self) {
    var data_type = self.options.data_type, format = self.options.format, target = self.options.target;
    if (self.image) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, GL_RGBA, data_type, self.image);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, GL_RGBA, data_type, self.image);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else if (self.images) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, GL_RGBA, data_type, self.images[0]);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_X] || self.images[0]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] || self.images[1]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] || self.images[2]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] || self.images[3]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] || self.images[4]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] || self.images[5]);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    }
  }
  
  /* pushLevel/popLevel are used for automatic management of glActiveTexture's.
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
    context.glActiveTexture(GL_TEXTURES[level]);
  }
  
  function popLevel(self, context) {
    Jax.Texture._level = self.textureLevel - 1;
    delete self.textureLevel;
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
     * 
     *   * min_filter (GL_NEAREST)
     *   * mag_filter (GL_NEARETS)
     *   * onload (null) - a function to be called after the image has been loaded. This function
     *                     will not be called if the image fails to load.
     *                     
     **/
    initialize: function(path_or_array, options) {
      var self = this;
      this.options = Jax.Util.normalizeOptions(options, {
        min_filter: GL_NEAREST,
        mag_filter: GL_NEAREST,
        generate_mipmap: true,
        mipmap_hint: GL_DONT_CARE,
        format: GL_RGBA,
        target: GL_TEXTURE_2D,
        data_type: GL_UNSIGNED_BYTE,
        wrap_s: GL_REPEAT,
        wrap_t: GL_REPEAT,
        flip_y: false,
        premultiply_alpha: false,
        colorspace_conversion: true,
        onload: null
      });

      if (typeof(path_or_array) == "string") {
        this.image = new Image();
        this.image.onload = function() { imageLoaded(self, false); };
        this.image.src = path_or_array;
      } else {
        var onload = function() { imageLoaded(self, true); };
        this.images = [];
        this.images.load_count = 0;
        for (var i = 0; i < path_or_array.length; i++) {
          this.images[i] = new Image();
          this.images[i].onload = onload;
          this.images[i].src = path_or_array[i];
        }
      }
      this.handles = {};
      this.loaded = false;
      this.valid = [];
    },
    
    refresh: function(context) {
      if (!this.loaded) return;
      
      context.glBindTexture(this.options.target, this.getHandle(context));
      generateTexture(context, this);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MAG_FILTER, this.options.mag_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MIN_FILTER, this.options.min_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_S, this.options.wrap_s);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_T, this.options.wrap_t);
      context.glPixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.options.flip_y);
      context.glPixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.options.premultiply_alpha);
      context.glPixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, this.options.colorspace_conversion ? GL_BROWSER_DEFAULT_WEBGL : GL_NONE);
      
      if (this.generate_mipmap) {
        this.generateMipmap(context);
      }
      
      this.valid[context.id] = true;
    },
    
    generateMipmap: function(context) {
      context.glHint(this.options.mipmap_hint);
      context.glGenerateMipmap(this.options.target);
    },
    
    invalidate: function() { this.valid.clear(); },
    
    dispose: function(context) {
      context.glDeleteTexture(getHandle(context));
      delete this.handles[context.id];
    },
    
    getHandle: function(context) {
      if (!this.handles[context.id]) build(this, context);
      return this.handles[context.id];
    },
    
    isValid: function(context) {
      return !!this.valid[context.id];
    },
    
    bind: function(context, level, callback) {
      if (!this.loaded) return; // no texture to display, yet... but not worth crashing over.
      if (!this.isValid(context)) this.refresh(context);
      
      if (typeof(level) == "number")
        pushLevel(this, level, context);
      else if (typeof(level) == "function") { callback = level; pushLevel(this, null, context); }
      
      context.glBindTexture(this.options.target, this.getHandle(context));
      if (callback)
      {
        callback.call(this, this.textureLevel);
        this.unbind(context);
      }
    },
    
    unbind: function(context) {
      if (this.textureLevel != undefined) context.glActiveTexture(GL_TEXTURES[this.textureLevel]);
      context.glBindTexture(this.options.target, null);
      popLevel(this, context);
    },
    
    ready: function() {
      return this.loaded;
    }
  });
})();

Jax.Texture._level = 0;
