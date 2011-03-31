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
    
    // texture attachments -- TODO wrap Jax.Texture
    handle.textures = [];
    var attachment = GL_COLOR_ATTACHMENT0;
    for (var i = 0; i < self.options.colors.length; i++) {
      var format = self.options.colors[i];
      handle.textures[i] = context.glCreateTexture();
      context.glBindTexture(GL_TEXTURE_2D, handle.textures[i]);
      try {
        context.glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, null);
      } catch (e) {
        var tex = new Uint8Array(width*height*Jax.Util.sizeofFormat(format));
        context.glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, tex);
      }
      
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
      
      // FIXME for depth render ONLY
//      context.glTexParameteri(GL_TEXTURE_2D, GL_DEPTH_TEXTURE_MODE, GL_LUMINANCE);
//      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_R_TO_TEXTURE);
//      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL);

      context.glBindTexture(GL_TEXTURE_2D, null);
      context.glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, handle.textures[i], 0);
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
      case (window['GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER'] || 0x8cdb):
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
     *   * color: optionally, in place of a colors array, a single color format as above. If both
     *            _color_ and _colors_ are specified, _color_ is simply added to the _colors_ array.
     *   * depth: true if a depth attachment is required, false otherwise.
     *   * stencil: true if a stencil attachment is required, false otherwise.
     *   * width: the width of the render and color buffers. All render and color buffers for a given
     *            framebuffer must have the same width. Defaults to 2048.
     *   * height: the height of the render and color buffers. All render and color buffers for a given
     *             framebuffer must have the same height. Defaults to 2048.
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
    
    bind: function(context, callback) {
      if (!this.getHandle(context)) build(context, this);
      context.glBindFramebuffer(GL_FRAMEBUFFER, this.getHandle(context));
      context.glViewport(0,0,this.options.width,this.options.height);
      
      if (callback) {
        callback.call(this);
        this.unbind(context);
      }
    },
    
    unbind: function(context) {            
      context.glBindFramebuffer(GL_FRAMEBUFFER, null);
      // restore the original context viewport
      context.glViewport(0, 0, context.canvas.width, context.canvas.height);
    },
    
    getTextureBuffer: function(context, index) { return this.getHandle(context).textures[index]; },
    
    getHandle: function(context) { return this.handles[context.id]; },
    setHandle: function(context, handle) { this.handles[context.id] = handle; }
  });
})();
