describe("Jax.Texture", function() {
  var _img = "/textures/rss.png";
  var tex;
  
  /* after_loading_it calls spec only when texture is ready */
  var after_loading_it = function(desc, testFunc) { 
    describe("after loading", function() {
      return jasmine.getEnv().it(desc, function() { 
        waitsFor(function() {
          if (tex.ready()) {
            testFunc.call(this);
            return true;
          }
          return false;
        }, 1000);
      }); 
    });
  };

  describe("with a path", function() {
    beforeEach(function() { tex = new Jax.Texture(_img); });

    after_loading_it("should return texture data", function() {
      expect(tex.getData()).not.toBeNull();
    });

    after_loading_it("should be renderable to", function() {
      // FIXME I really don't know how to test this.
      var self = this;
      var model = new Jax.Model({mesh: new Jax.Mesh.Quad(), position: [0, 0, -1]});
      spyOn(self.context.gl, 'bindFramebuffer').andCallThrough();
      spyOn(model, 'render').andCallThrough();
      tex.renderTo(this.context, function(fb) {
        expect(fb).toBeInstanceOf(Jax.Framebuffer);
        model.render(self.context);
      });
      expect(self.context.gl.bindFramebuffer).toHaveBeenCalled();
      expect(model.render).toHaveBeenCalled();
    });

    describe("before loading", function() {
      it("should return null", function() {
        tex.ready = function() { return false; };
        expect(tex.getData()).toBeNull();
      });
    });
  });
  
  describe("using strings instead of enums", function() {
    // which is what happens when loaded from a resource
    it("should detect enums", function() {
      var tex = new Jax.Texture({
        min_filter: 'GL_NEAREST',
        mag_filter: 'GL_NEAREST',
        mipmap_hint: 'GL_DONT_CARE',
        format: 'GL_RGBA',
        target: 'GL_TEXTURE_2D',
        data_type: 'GL_UNSIGNED_BYTE',
        wrap_s: 'GL_REPEAT',
        wrap_t: 'GL_REPEAT'
      });
      
      expect(tex.options.min_filter).toEqual(GL_NEAREST);
      expect(tex.options.mag_filter).toEqual(GL_NEAREST);
      expect(tex.options.mipmap_hint).toEqual(GL_DONT_CARE);
      expect(tex.options.format).toEqual(GL_RGBA);
      expect(tex.options.target).toEqual(GL_TEXTURE_2D);
      expect(tex.options.data_type).toEqual(GL_UNSIGNED_BYTE);
      expect(tex.options.wrap_s).toEqual(GL_REPEAT);
      expect(tex.options.wrap_t).toEqual(GL_REPEAT);
    });
  });
  
  describe("NPOT", function() {
    beforeEach(function() {
      tex = new Jax.Texture("/textures/brickwall.jpg");
    });
    
    after_loading_it("should automatically use NPOT-compatible options", function() {
      expect(tex.options.mag_filter).toEqual(GL_LINEAR);
      expect(tex.options.min_filter).toEqual(GL_LINEAR);
      expect(tex.options.wrap_s).toEqual(GL_CLAMP_TO_EDGE);
      expect(tex.options.wrap_t).toEqual(GL_CLAMP_TO_EDGE);
      expect(tex.options.generate_mipmap).toBeFalsy();
    });
    
    after_loading_it("should render successfully", function() {
      var matr = new Jax.Material({layers: [{type: 'Texture', instance: tex}]});
      var m = new Jax.Model({mesh: new Jax.Mesh.Quad({material: matr})});
      m.render(SPEC_CONTEXT);
    });
  });
  
  describe("cube map", function() {
    describe("with no image", function() {
      beforeEach(function() {
        tex = new Jax.Texture(null, {target:GL_TEXTURE_CUBE_MAP,width:128,height:128});
        spyOn(SPEC_CONTEXT.gl, 'bindTexture').andCallThrough();
      });
      
      it("should bind successfully", function() {
        expect(function(){tex.bind(SPEC_CONTEXT);}).not.toThrow();
        expect(SPEC_CONTEXT.gl.bindTexture).toHaveBeenCalled();
      });
    });
    
    describe("with a single POT texture", function() {
      beforeEach(function() { tex = new Jax.Texture(_img, {target:GL_TEXTURE_CUBE_MAP}); });
      
      after_loading_it("should bind successfully", function() {
        expect(function() { tex.bind(SPEC_CONTEXT); }).not.toThrow();
      });
    });

    describe("with 6 POT textures", function() {
      beforeEach(function() { tex = new Jax.Texture([_img,_img,_img,_img,_img,_img]); });
      
      it("should set default target appropriately", function() {
        expect(tex.options.target).toEqual(GL_TEXTURE_CUBE_MAP);
      });
      
      after_loading_it("should bind successfully", function() {
        expect(function() { tex.bind(SPEC_CONTEXT); }).not.toThrow();
      });
    });
  });
  
  describe("with no image", function() {
    beforeEach(function() {
      tex = new Jax.Texture(null, {target:GL_TEXTURE_2D,width:128,height:128});
      spyOn(SPEC_CONTEXT.gl, 'bindTexture').andCallThrough();
    });
      
    it("should bind successfully", function() {
      expect(function(){tex.bind(SPEC_CONTEXT);}).not.toThrow();
      expect(SPEC_CONTEXT.gl.bindTexture).toHaveBeenCalled();
    });
  });
    
  describe("POT with default options", function() {
    beforeEach(function() { tex = new Jax.Texture(_img); });
    
    describe("when bound with block", function() {
      after_loading_it("should increment textureLevel", function() {
        tex.bind(SPEC_CONTEXT, function(textureLevel0) {
          expect(textureLevel0).toEqual(0);
          expect(this).toEqual(tex);
          expect(tex.textureLevel).toEqual(0);
          
          tex.bind(SPEC_CONTEXT, function(textureLevel1) {
            expect(textureLevel1).toEqual(1);
            expect(this).toEqual(tex);
            expect(tex.textureLevel).toEqual(1);
          });
        });
        
        expect(tex.textureLevel).toBeUndefined();
      });
    });
    
    describe("when bound without block with level", function() {
      beforeEach(function() {
        waitsFor(function() { return tex.ready(); }, 1000);
        spyOn(SPEC_CONTEXT.gl, 'activeTexture').andCallThrough();
      });
      
      it("should use texture 1", function() {
        tex.bind(SPEC_CONTEXT, 1);
        expect(SPEC_CONTEXT.gl.activeTexture).toHaveBeenCalledWith(GL_TEXTURE1);
      });
    });
    
    describe("when bound without block", function() {
      beforeEach(function() { waitsFor(function() { return tex.ready(); }, 1000); tex.bind(SPEC_CONTEXT); });
      
      it("should create a GL texture handle", function() {
        expect(tex.getHandle(SPEC_CONTEXT)).not.toBeUndefined();
      });
      
      it("should bind without error", function() {
        expect(function() { tex.bind(SPEC_CONTEXT); }).not.toThrow();
      });
    });
    
    after_loading_it("should initialize", function() {
      expect(tex.ready()).toBeTruthy();
    });
  });
  
  describe("POT with #onload", function() {
    var loaded;
    beforeEach(function() { loaded = false;tex = new Jax.Texture(_img, {onload:function(){loaded=true;}}); });
    
    after_loading_it("should call #onload", function() {
      expect(loaded).toBeTruthy();
    });
  });
});
