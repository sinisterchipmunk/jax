/**
 * class Jax.Framebuffer
 *
 * Used for rendering images off-screen and capturing the result.
 **/
Jax.Framebuffer = (function() {
  function build(context, self) {
    var handle = context.glCreateFramebuffer();
    var width = self.options.width, height = self.options.height;

    self.setHandle(context, handle);
    context.glBindFramebuffer(GL_FRAMEBUFFER, handle);

    // depth and stencil attachment
    if (self.options.depth && self.options.stencil) {
      handle.depthstencilbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.depthstencilbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_STENCIL, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.depthstencilbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }
    
    // depth attachment
    if (self.options.depth && !self.options.stencil) {
      handle.depthbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.depthbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, handle.depthbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }
    
    // stencil attachment
    if (self.options.stencil && !self.options.depth) {
      handle.stencilbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.stencilbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_STENCIL_INDEX8, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.stencilbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }
    
    // texture attachments
    handle.textures = [];
    var attachment = GL_COLOR_ATTACHMENT0;
    for (var i = 0; i < self.options.colors.length; i++) {
      var format = self.options.colors[i];
      var texture_options = {
        format:GL_RGBA,
        width:width,
        height:height,
        min_filter:GL_LINEAR,
        mag_filter:GL_LINEAR,
        wrap_s:GL_CLAMP_TO_EDGE,
        wrap_t:GL_CLAMP_TO_EDGE,
        generate_mipmap:false
      };
      if (typeof(format) != "number") { texture_options = Jax.Util.normalizeOptions(format, texture_options); }
      else { texture_options.format = format; }
      handle.textures[i] = new Jax.Texture(texture_options);
      
      if (handle.textures[i].getTarget() == GL_TEXTURE_2D)
        context.glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, handle.textures[i].getHandle(context), 0);
      else
        context.glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
                handle.textures[i].getHandle(context), 0);
      
      attachment++;
    }

    checkStatus(context, self);
  }
  
  function checkStatus(context, self) {
    var status = context.glCheckFramebufferStatus(GL_FRAMEBUFFER);
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
        for (which in context.gl)
          if (context.gl[which] == status)
            throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+" - "+which+")");
        throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+")");
    }
  }
  
  return Jax.Class.create({
    /**
     * new Jax.Framebuffer([options])
     * - options (Object): a generic object containing the following optional properties:
     * 
     *   * colors: an array of color formats such as GL_RGBA, GL_RGB, etc. The _colors_ array may
     *             be empty if no color attachments are needed. Defaults to [GL_RGBA] unless _color_
     *             is specified.
     *             
     *             Alternatively, an options object can be used. This object will be passed into
     *             Jax.Texture().
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
     **/
    initialize: function(options) {
      var defaults = {
        depth: false,
        stencil: false,
        width:512,
        height:512
      };
      if (!(options && (options.color || options.colors))) defaults.colors = [GL_RGBA];
      
      this.handles = {};
      this.options = options = Jax.Util.normalizeOptions(options, defaults);
      if (options.color != undefined) {
        if (options.colors != undefined) options.colors.push(options.color);
        else options.colors = [options.color];
        delete options.color;
      }
    },

    /**
     * Jax.Framebuffer#cubeFace(context, texIndex, faceEnum[, callback]) -> Jax.Framebuffer
     * - context (Jax.Context): a Jax context
     * - texIndex (number): the index of the cube map texture
     * - faceEnum (enum): the cube map face to bind
     * - callback (function): an optional callback. If given, the framebuffer will be automatically unbound
     *                        after the callback returns. Otherwise, the framebuffer will remain bound.
     *                        
     * For cube map framebuffers only, this will bind the specified cube map face to its color buffer position.
     * The faceEnum can be any of the following face enums:
     * 
     *     0: GL_TEXTURE_CUBE_MAP_POSITIVE_X
     *     1: GL_TEXTURE_CUBE_MAP_NEGATIVE_X
     *     2: GL_TEXTURE_CUBE_MAP_POSITIVE_Y
     *     3: GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
     *     4: GL_TEXTURE_CUBE_MAP_POSITIVE_Z
     *     5: GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
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
      if (!this.getHandle(context)) build(context, this);
      var texture = this.getHandle(context).textures[texIndex];
      if (texture.options.target != GL_TEXTURE_CUBE_MAP)
        throw new Error("Texture at index "+texIndex+" is not a cube map!");
      
      this.bind(context);
      context.glFramebufferTexture2D(GL_FRAMEBUFFER, window['GL_COLOR_ATTACHMENT'+texIndex],
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
      if (!this.getHandle(context)) build(context, this);
      context.glBindFramebuffer(GL_FRAMEBUFFER, this.getHandle(context));
      
      if (callback) {
        callback.call(this);
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Framebuffer#unbind(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to bind this framebuffer to
     *
     * Unbinds this framebuffer from the specified context. Note that this is
     * unnecessary if Jax.Framebuffer#bind() was called with a callback.
     **/
    unbind: function(context) {            
      context.glBindFramebuffer(GL_FRAMEBUFFER, null);
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
      context.glViewport(0,0,this.options.width,this.options.height);
      return this;
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
      if (!this.getHandle(context)) build(context, this);
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
    
    /** deprecated
     * Jax.Framebuffer#getTextureBuffer(context, index) -> Jax.Texture
     *
     * This method is deprecated. See Jax.Framebuffer#getTexture instead.
     **/
    getTextureBuffer: function(context, index) {
      alert("Jax.Framebuffer#getTextureBuffer(context, index) is deprecated.\n"+
            "Please use Jax.Framebuffer#getTexture(context, index) instead.\n\n"+
            "Stack trace:\n\n"+
            (new Error().stack || "(unavailable)"));
      return this.getTexture(context, index);
    },
    
    /** deprecated
     * Jax.Framebuffer#getTextureBufferHandle(context, index) -> WebGLTexture
     *
     * This method is deprecated. See Jax.Framebuffer#getTextureHandle instead.
     **/
    getTextureBufferHandle: function(context, index) {
      alert("Jax.Framebuffer#getTextureBufferHandle(context, index) is deprecated.\n"+
            "Please use Jax.Framebuffer#getTextureHandle(context, index) instead.\n\n"+
            "Stack trace:\n\n"+
            (new Error().stack || "(unavailable)"));
      return this.getTextureHandle(context, index);
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
    setHandle: function(context, handle) { this.handles[context.id] = handle; return this; }
  });
})();
