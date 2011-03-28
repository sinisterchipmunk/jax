Jax.Framebuffer = (function() {
  function build(self, context) {
    self.framebuffer = context.glCreateFramebuffer();
    self.renderbuffer = context.glCreateRenderbuffer();
    self.texture = context.glCreateTexture();
    
    context.glBindTexture(GL_TEXTURE_2D, self.texture);
  
    //TODO update when null is accepted
    try {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, self.width, self.height, 0, GL_RGB, GL_UNSIGNED_BYTE, null);
    } catch (e) {
      var tex = new Uint8Array(3);
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, self.width, self.height, 0, GL_RGB, GL_UNSIGNED_BYTE, tex);
    }
      
    context.glBindFramebuffer(GL_FRAMEBUFFER, self.framebuffer);
    context.glBindRenderbuffer(GL_RENDERBUFFER, self.renderbuffer);
    context.glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, self.width, self.height);
    context.glBindRenderbuffer(GL_RENDERBUFFER, null);
      
    context.glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, self.texture, 0);
    context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, self.renderbuffer);
    context.glBindFramebuffer(GL_FRAMEBUFFER, null);
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = options || {};
      
      this.width = options.width || 2048;
      this.height = options.height || 2048;
      this.colorDepth = options.colorDepth || GL_RGBA;
      
      this.options = options;
      this.handles = [];
    },
    
    getTexture: function() { return this.texture; },

    bind: function(context, callback) {
      if (!this.framebuffer) build(this, context);
      context.glBindFramebuffer(GL_FRAMEBUFFER, this.framebuffer);
      context.glViewport(0,0,this.width,this.height);
      
      if (callback) {
        callback();
        this.unbind(context);
      }
    },
    
    unbind: function(context) {
      context.glBindTexture(GL_TEXTURE_2D, this.texture);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
      context.glGenerateMipmap(GL_TEXTURE_2D);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
      context.glBindFramebuffer(GL_FRAMEBUFFER, null);

      // restore the original context viewport
      context.glViewport(0, 0, context.canvas.width, context.canvas.height);
    }
  });
})();
