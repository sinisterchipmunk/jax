/**
 * class Jax.Framebuffer
 *
 * Used for rendering images off-screen and capturing the result.
 **/
Jax.Framebuffer = (function() {
  function build(context, self) {
    var handle = context.renderer.createFramebuffer();
    var width = self.options.width, height = self.options.height;

    self.setHandle(context, handle);
    context.renderer.bindFramebuffer(GL_FRAMEBUFFER, handle);
    
    /*
    Depth textures are better handled in Jax.Texture, and have the benefit
    of being able to be used as color components in Jax.Framebuffer. In either
    case, they don't belong here, because the code below will attempt to use
    a depth texture in place of a depth buffer, which is a misunderstanding
    of what a depth texture actually is.

    I'm leaving the code below in place as a comment for future reference,
    for when depth textures are properly implemented as e.g. Jax.DepthTexture.
    This will probably happen circa Jax v3.1.

    if (self.extension = context.renderer.getExtension('WEBKIT_WEBGL_depth_texture') ||
                         context.renderer.getExtension('MOZ_WEBGL_depth_texture') ||
                         context.renderer.getExtension('WEBGL_depth_texture')) {
      if (self.options.depth) {
        self.depthTexture = context.renderer.createTexture();
        context.renderer.bindTexture(GL_TEXTURE_2D, self.depthTexture);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        context.renderer.texImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, self.options.width, self.options.height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, null);
      }
      if (self.options.stencil) {
        self.stencilTexture = context.renderer.createTexture();
        context.renderer.bindTexture(GL_TEXTURE_2D, self.stencilTexture);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        context.renderer.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        context.renderer.texImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, self.options.width, self.options.height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, null);
      }
    } else {
    */
      // depth and stencil attachment
      if (self.options.depth && self.options.stencil) {
        handle.depthstencilbuffer = context.renderer.createRenderbuffer();
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, handle.depthstencilbuffer);
        context.renderer.renderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_STENCIL, width, height);
        context.renderer.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.depthstencilbuffer);
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    
      // depth attachment
      if (self.options.depth && !self.options.stencil) {
        handle.depthbuffer = context.renderer.createRenderbuffer();
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, handle.depthbuffer);
        context.renderer.renderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
        context.renderer.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, handle.depthbuffer);
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    
      // stencil attachment
      if (self.options.stencil && !self.options.depth) {
        handle.stencilbuffer = context.renderer.createRenderbuffer();
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, handle.stencilbuffer);
        context.renderer.renderbufferStorage(GL_RENDERBUFFER, GL_STENCIL_INDEX8, width, height);
        context.renderer.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.stencilbuffer);
        context.renderer.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    // }
    
    // texture attachments
    handle.textures = [];
    var attachment = GL_COLOR_ATTACHMENT0;
    for (var i = 0; i < self.options.colors.length; i++) {
      var format = self.options.colors[i];
      if (self.options.colors[i] instanceof Jax.Texture) {
        handle.textures[i] = self.options.colors[i];
      } else {
        var texture_options = {
          format:GL_RGBA,
          width:width,
          height:height,
          min_filter:self.options.min_filter,
          mag_filter:self.options.mag_filter,
          wrap_s:self.options.wrap_s,
          wrap_t:self.options.wrap_t,
          generate_mipmap:self.options.generate_mipmap,
          data_type: self.options.data_type
        };
        if (typeof(format) != "number") {
          texture_options = Jax.Util.merge(format, texture_options);
        }
        else { texture_options.format = format; }
        handle.textures[i] = new Jax.Texture(texture_options);
      }
      
      if (handle.textures[i].get('target') == GL_TEXTURE_2D) {
        var handle;
        if (handle = handle.textures[i].validate(context))
          context.renderer.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D,
                  handle, 0);
      }
      else
        context.renderer.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
                handle.textures[i].getHandle(context), 0);
      
      attachment++;
    }
    
    try {
      checkStatus(context, self);
    } catch(e) {
      // build failed, release all objects so user can (maybe) change options and try again
      self.dispose(context);
      throw e;
    }
  }
  
  function checkStatus(context, self) {
    var status = context.renderer.checkFramebufferStatus(GL_FRAMEBUFFER);
    self.unbind(context);
    switch(status) {
      case GL_FRAMEBUFFER_COMPLETE:
        // success!
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        throw new Error("Jax.Framebuffer: one or more attachments is incomplete. (GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        throw new Error("Jax.Framebuffer: there are no images attached to the framebuffer. (GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        throw new Error("Jax.Framebuffer: all attachments must have the same dimensions. (GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS)");
      case GL_FRAMEBUFFER_UNSUPPORTED:
        throw new Error("Jax.Framebuffer: the requested framebuffer layout is unsupported on this hardware. (GL_FRAMEBUFFER_UNSUPPORTED)");
      case (Jax.getGlobal()['GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER'] || 0x8cdb):
        // a cryptic error that is not in the WebGL spec. Took me way too long to figure this out and I'm still not
        // sure why it happens...
        // but it seems to crop up primarily when no textures are attached.
        // from opengl (not webgl) spec: The value of FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE_EXT must not be NONE for any
        // color attachment point(s) named by DRAW_BUFFER.
        throw new Error("Jax.Framebuffer: make sure the framebuffer has at least 1 texture attachment. (GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER)");
      default:
        var which;
        for (which in context.renderer)
          if (context.renderer[which] == status)
            throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+" - "+which+")");
        throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+")");
    }
  }

  /**
   * new Jax.Framebuffer([options])
   * - options (Object): a generic object containing the following optional properties:
   * 
   *   * colors: an array of color formats such as GL_RGBA, GL_RGB, etc. The _colors_ array may
   *             be empty if no color attachments are needed. Defaults to [GL_RGBA] unless _color_
   *             is specified.
   *             
   *             Alternatively, an options object can be used. This object will be passed into
   *             Jax.Texture(). Or, the object may be an actual instance of Jax.Texture, which
   *             will be used directly.
   *             
   *   * color: optionally, in place of a colors array, a single color format as above. If both
   *            _color_ and _colors_ are specified, _color_ is simply added to the _colors_ array.
   *   * depth: true if a depth attachment is required, false otherwise. Defaults to false.
   *   * stencil: true if a stencil attachment is required, false otherwise. Defaults to false.
   *   * width: the width of the render and color buffers. All render and color buffers for a given
   *            framebuffer must have the same width. Defaults to 512.
   *   * height: the height of the render and color buffers. All render and color buffers for a given
   *             framebuffer must have the same height. Defaults to 512.
   *
   * The following options may also be present. If they are, they will be passed into Jax.Texture:
   * 
   *   * data_type: defaults to GL_UNSIGNED_BYTE
   *   * min_filter: defaults to GL_LINEAR
   *   * mag_filter: defaults to GL_LINEAR
   *   * wrap_s: defaults to GL_CLAMP_TO_EDGE
   *   * wrap_t: defaults to GL_CLAMP_TO_EDGE
   *   * generate_mipmap: defaults to false
   *     
   **/
  function Framebuffer(options) {
    var defaults = {
      depth: false,
      stencil: false,
      width:512,
      height:512,
      data_type: GL_UNSIGNED_BYTE,
      min_filter: GL_LINEAR,
      mag_filter: GL_LINEAR,
      wrap_s: GL_CLAMP_TO_EDGE,
      wrap_t: GL_CLAMP_TO_EDGE,
      generate_mipmap: false
    };
    if (!(options && (options.color || options.colors))) defaults.colors = [GL_RGBA];
    
    this.handles = {};
    this.options = options = Jax.Util.merge(options, defaults);
    if (options.color != undefined) {
      if (options.colors != undefined) options.colors.push(options.color);
      else options.colors = [options.color];
      delete options.color;
    }
  }


  jQuery.extend(Framebuffer.prototype, {
    dispose: function(context) {
      if (!this.handles) return;
      
      var handle = this.getHandle(context);
      if (!handle) return;
      
      // handle.stencilbuffer, handle.depthbuffer, handle.depthstencilbuffer
      if (handle.stencilbuffer) {
        context.renderer.deleteRenderbuffer(handle.stencilbuffer);
        delete handle.stencilbuffer;
      }
      if (handle.depthbuffer) {
        context.renderer.deleteRenderbuffer(handle.depthbuffer);
        delete handle.depthbuffer;
      }
      if (handle.depthstencilbuffer) {
        context.renderer.deleteRenderbuffer(handle.depthstencilbuffer);
        delete handle.depthstencilbuffer;
      }
      
      // texture attachments
      if (handle.textures) {
        while (handle.textures.length > 0) {
          handle.textures[0].dispose(context);
          handle.textures.splice(0, 1);
        }
        delete handle.textures;
      }
      
      // finally, delete the framebuffer itself
      context.renderer.deleteFramebuffer(handle);
      this.setHandle(context, null);
    },
    
    /**
     * Jax.Framebuffer#bindCubeFace(context, texIndex, faceEnum[, callback]) -> Jax.Framebuffer
     * - context (Jax.Context): a Jax context
     * - texIndex (number): the index of the cube map texture
     * - faceEnum (enum): the cube map face to bind
     * - callback (function): an optional callback. If given, the framebuffer will be automatically unbound
     *                        after the callback returns. Otherwise, the framebuffer will remain bound.
     *                        
     * For cube map framebuffers only, this will bind the specified cube map face to its color buffer position.
     * The faceEnum can be any of the following face enums:
     * 
     *     0 or GL_TEXTURE_CUBE_MAP_POSITIVE_X
     *     1 or GL_TEXTURE_CUBE_MAP_NEGATIVE_X
     *     2 or GL_TEXTURE_CUBE_MAP_POSITIVE_Y
     *     3 or GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
     *     4 or GL_TEXTURE_CUBE_MAP_POSITIVE_Z
     *     5 or GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
     * 
     * Example:
     * 
     *     fb.bindCubeFace(context, 0, GL_TEXTURE_CUBE_MAP_POSITIVE_X, function() {
     *       // render to +X cube face
     *     });
     *     fb.bindCubeFace(context, 0, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, function() {
     *       // render to -Z cube face
     *     });
     **/
    bindCubeFace: function(context, texIndex, faceEnum, callback) {
      var texture = this.getTexture(context, texIndex);
      if (texture.options.target != GL_TEXTURE_CUBE_MAP)
        throw new Error("Texture at index "+texIndex+" is not a cube map!");
      
      this.bind(context);
      context.renderer.framebufferTexture2D(GL_FRAMEBUFFER, window['GL_COLOR_ATTACHMENT'+texIndex],
              faceEnum, texture.getHandle(context), 0);
      
      if (callback) {
        callback();
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Framebuffer#bind(context[, callback]) -> Jax.Framebuffer
     * - context (Jax.Context): the context to bind this framebuffer to
     * - callback (Function): an optional callback. If given, the framebuffer will
     *                        be automatically unbound after the function returns.
     *
     * If a callback is not specified, the framebuffer will be bound and then returned.
     * Otherwise, the framebuffer will be bound; the callback will be called; then the
     * framebuffer will be automatically unbound prior to returning the framebuffer
     * itself.
     *
     **/
    bind: function(context, callback) {
      this.validate(context);
      context.renderer.bindFramebuffer(GL_FRAMEBUFFER, this.getHandle(context));
      
      if (callback) {
        callback.call(this);
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Framebuffer#validate(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to validate this framebuffer for
     * 
     * If this framebuffer's underlying WebGL counterpart has not yet been
     * created, this method will do so. This method may raise errors per the
     * WebGL specification if the framebuffer is not complete or compatible
     * with the client hardware.
     *
     * After successful construction, or if the framebuffer has already been
     * built, this framebuffer is returned.
     **/
    validate: function(context) {
      if (!this.getHandle(context)) build(context, this);
      return this;
    },
    
    /**
     * Jax.Framebuffer#countTextures(context) -> Jax.Framebuffer
     * - context (Jax.Context): a WebGL context
     *
     * Returns the number of textures associated with this framebuffer.
     **/
    countTextures: function(context) {
      return this.validate().getHandle(context).textures.length;
    },
    
    /**
     * Jax.Framebuffer#unbind(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to bind this framebuffer to
     *
     * Unbinds this framebuffer from the specified context. Note that this is
     * unnecessary if Jax.Framebuffer#bind() was called with a callback.
     **/
    unbind: function(context) {            
      context.renderer.bindFramebuffer(GL_FRAMEBUFFER, null);
      return this;
    },
    
    /**
     * Jax.Framebuffer#viewport(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to set the viewport for
     *
     * Sets the viewport up for this framebuffer within the specified context
     * according to the +width+ and +height+ options given for this framebuffer.
     *
     **/
    viewport: function(context) {
      context.renderer.viewport(0,0,this.options.width,this.options.height);
      return this;
    },
    
    getDepthTexture: function(context) {
      this.validate(context);
      return this.depthTexture;
    },
    
    getStencilTexture: function(context) {
      this.validate(context);
      return self.stencilTexture;
    },
    
    /**
     * Jax.Framebuffer#getTexture(context[, index]) -> Jax.Texture
     * - context (Jax.Context): the context to retrieve the texture for
     * - index (Number): the numeric index of the texture to retrieve.
     *                   Defaults to 0.
     *
     * Returns the specified instance of Jax.Texture associated with this
     * framebuffer and the specified context. If index is not given, the
     * first texture available is returned.
     **/
    getTexture: function(context, index) {
      this.validate(context);
      return this.getHandle(context).textures[index || 0];
    },
    
    /**
     * Jax.Framebuffer#getTextureHandle(context[, index]) -> WebGLTexture
     * - context (Jax.Context): the context to retrieve the texture handle for
     * - index (Number): the numeric index of the texture handle to retrieve.
     *                   Defaults to 0.
     *
     * Returns the WebGL texture handle associated with this
     * framebuffer and the specified context. If index is not given, the
     * first texture available is returned.
     *
     * This is equivalent to:
     * 
     *     framebuffer.getTexture(context, index).getHandle(context);
     *
     **/
    getTextureHandle: function(context, index) {
      return this.getTexture(context, index).getHandle(context);
    },
    
    /**
     * Jax.Framebuffer#getHandle(context) -> WebGLFramebuffer | undefined
     * - context (Jax.Context): the context the requested framebuffer handle is associated with
     * 
     * Returns the WebGLFramebuffer handle associated with the specified context.
     **/
    getHandle: function(context) { return this.handles[context.id]; },
    
    /**
     * Jax.Framebuffer#getHandle(context, handle) -> Jax.Framebuffer
     * - context (Jax.Context): the context the requested framebuffer handle is associated with
     * - handle (WebGLFramebuffer): the WebGL framebuffer handle to use for the specified context
     * 
     * Assigns the specified handle to be used for the given context. This is a permanent
     * assignment unless this method is called again.
     *
     * Returns this instance of Jax.Framebuffer.
     **/
    setHandle: function(context, handle) {
      if (handle)
        this.handles[context.id] = handle;
      else if (this.handles[context.id])
        delete this.handles[context.id];
      return this;
    }
  });

  return Framebuffer;
})();
