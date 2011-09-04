describe("Texture", function() {
  var _img = "/textures/rss.png";
  var tex;
  
  /* _it calls spec only when texture is ready */
  var _it = function(desc, testFunc) { 
    return jasmine.getEnv().it(desc, function() { 
      waitsFor(function() { if (tex.ready()) { testFunc(); return true; } return false; }, 1000); 
    }); 
  };
  
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
    
    _it("should automatically use NPOT-compatible options", function() {
      expect(tex.options.mag_filter).toEqual(GL_LINEAR);
      expect(tex.options.min_filter).toEqual(GL_LINEAR);
      expect(tex.options.wrap_s).toEqual(GL_CLAMP_TO_EDGE);
      expect(tex.options.wrap_t).toEqual(GL_CLAMP_TO_EDGE);
      expect(tex.options.generate_mipmap).toBeFalsy();
    });
    
    _it("should render successfully", function() {
      var matr = new Jax.Material.Texture(tex);
      var m = new Jax.Model({mesh: new Jax.Mesh.Quad({material: matr})});
//      var context = new Jax.Context('canvas-element');
      m.render(SPEC_CONTEXT);
      // context.dispose();
    });
  });
  
  describe("cube map", function() {
    describe("with no image", function() {
      beforeEach(function() {
        tex = new Jax.Texture(null, {target:GL_TEXTURE_CUBE_MAP,width:128,height:128});
        spyOn(SPEC_CONTEXT, 'glBindTexture').andCallThrough();
      });
      
      it("should bind successfully", function() {
        expect(function(){tex.bind(SPEC_CONTEXT);}).not.toThrow();
        expect(SPEC_CONTEXT.glBindTexture).toHaveBeenCalled();
      });
    });
    
    describe("with a single POT texture", function() {
      beforeEach(function() { tex = new Jax.Texture(_img, {target:GL_TEXTURE_CUBE_MAP}); });
      
      _it("should bind successfully", function() {
        expect(function() { tex.bind(SPEC_CONTEXT); }).not.toThrow();
      });
    });

    describe("with 6 POT textures", function() {
      beforeEach(function() { tex = new Jax.Texture([_img,_img,_img,_img,_img,_img], {target:GL_TEXTURE_CUBE_MAP}); });
      
      _it("should bind successfully", function() {
        expect(function() { tex.bind(SPEC_CONTEXT); }).not.toThrow();
      });
    });
  });
  
  describe("with no image", function() {
    beforeEach(function() {
      tex = new Jax.Texture(null, {target:GL_TEXTURE_2D,width:128,height:128});
      spyOn(SPEC_CONTEXT, 'glBindTexture').andCallThrough();
    });
      
    it("should bind successfully", function() {
      expect(function(){tex.bind(SPEC_CONTEXT);}).not.toThrow();
      expect(SPEC_CONTEXT.glBindTexture).toHaveBeenCalled();
    });
  });
    
  describe("POT with default options", function() {
    beforeEach(function() { tex = new Jax.Texture(_img); });
    
    describe("when bound with block", function() {
      _it("should increment textureLevel", function() {
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
        spyOn(SPEC_CONTEXT, 'glActiveTexture').andCallThrough();
      });
      
      it("should use texture 1", function() {
        tex.bind(SPEC_CONTEXT, 1);
        expect(SPEC_CONTEXT.glActiveTexture).toHaveBeenCalledWith(GL_TEXTURE1);
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
    
    _it("should initialize", function() {
      expect(tex.ready()).toBeTruthy();
    });
  });
  
  describe("POT with #onload", function() {
    var loaded;
    beforeEach(function() { loaded = false;tex = new Jax.Texture(_img, {onload:function(){loaded=true;}}); });
    
    _it("should call #onload", function() {
      expect(loaded).toBeTruthy();
    });
  });
});
