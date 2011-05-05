describe("Texture", function() {
  var _img = "/public/images/rss.png";
  
  var c; // Jax context
  var tex;
  beforeEach(function() { c = new Jax.Context('canvas-element'); });
  
  /* _it calls spec only when texture is ready */
  var _it = function(desc, testFunc) { 
    return jasmine.getEnv().it(desc, function() { 
      waitsFor(function() { if (tex.ready()) { testFunc(); return true; } return false; }, 1000); 
    }); 
  };
  
  describe("NPOT", function() {
    beforeEach(function() {
      tex = new Jax.Texture("/public/images/brickwall.jpg");
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
      var context = new Jax.Context('canvas-element');
      m.render(context);
      context.dispose();
    });
  });
  
  describe("cube map", function() {
    describe("with no image", function() {
      beforeEach(function() {
        tex = new Jax.Texture(null, {target:GL_TEXTURE_CUBE_MAP,width:128,height:128});
        spyOn(c, 'glBindTexture').andCallThrough();
      });
      
      it("should bind successfully", function() {
        expect(function(){tex.bind(c);}).not.toThrow();
        expect(c.glBindTexture).toHaveBeenCalled();
      });
    });
    
    describe("with a single POT texture", function() {
      beforeEach(function() { tex = new Jax.Texture(_img, {target:GL_TEXTURE_CUBE_MAP}); });
      
      _it("should bind successfully", function() {
        expect(function() { tex.bind(c); }).not.toThrow();
      });
    });

    describe("with 6 POT textures", function() {
      beforeEach(function() { tex = new Jax.Texture([_img,_img,_img,_img,_img,_img], {target:GL_TEXTURE_CUBE_MAP}); });
      
      _it("should bind successfully", function() {
        expect(function() { tex.bind(c); }).not.toThrow();
      });
    });
  });
  
  describe("with no image", function() {
    beforeEach(function() {
      tex = new Jax.Texture(null, {target:GL_TEXTURE_2D,width:128,height:128});
      spyOn(c, 'glBindTexture').andCallThrough();
    });
      
    it("should bind successfully", function() {
      expect(function(){tex.bind(c);}).not.toThrow();
      expect(c.glBindTexture).toHaveBeenCalled();
    });
  });
    
  describe("POT with default options", function() {
    beforeEach(function() { tex = new Jax.Texture(_img); });
    
    describe("when bound with block", function() {
      _it("should increment textureLevel", function() {
        tex.bind(c, function(textureLevel0) {
          expect(textureLevel0).toEqual(0);
          expect(this).toEqual(tex);
          expect(tex.textureLevel).toEqual(0);
          
          tex.bind(c, function(textureLevel1) {
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
        spyOn(c, 'glActiveTexture').andCallThrough();
      });
      
      it("should use texture 1", function() {
        tex.bind(c, 1);
        expect(c.glActiveTexture).toHaveBeenCalledWith(GL_TEXTURE1);
      });
    });
    
    describe("when bound without block", function() {
      beforeEach(function() { waitsFor(function() { return tex.ready(); }, 1000); tex.bind(c); });
      
      it("should create a GL texture handle", function() {
        expect(tex.getHandle(c)).not.toBeUndefined();
      });
      
      it("should bind without error", function() {
        expect(function() { tex.bind(c); }).not.toThrow();
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
