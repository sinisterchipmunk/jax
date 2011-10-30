describe("Jax.Shader.Manifest", function() {
  var manifest;
  var img = "/textures/rss.png";
  
  beforeEach(function() {
    manifest = new Jax.Shader.Manifest();
  });
  
  describe("special handling for Jax textures", function() {
    var tex0, tex1;
    
    beforeEach(function() {
      tex0 = new Jax.Texture(img);
      tex1 = new Jax.Texture(img);
      waitsFor(function() {
        if (tex0.loaded && tex1.loaded) {
          spyOn(SPEC_CONTEXT, 'glActiveTexture');
          spyOn(tex0, 'bind');
          spyOn(tex1, 'bind');
          manifest.texture('Texture0', tex0, SPEC_CONTEXT);
          manifest.texture('Texture1', tex1, SPEC_CONTEXT);
          return true;
        }
        return false;
      });
    });
    
    // see Jax.Material for the reason this is disabled
    xit("should not allow more than the maximum number of textures to be bound", function() {
      expect(function() {
        for (var j = 0; j < GL_MAX_ACTIVE_TEXTURES+1; j++) {
          manifest.texture('Texture'+j, tex0, SPEC_CONTEXT);
        }
      }).toThrow("Maximum number of textures ("+GL_MAX_ACTIVE_TEXTURES+") has been reached!");
    });
    
    it("should recycle texture slots", function () {
      var i = manifest.getValue('Texture0');
      manifest.texture('Texture0', tex1, SPEC_CONTEXT);
      expect(manifest.getValue('Texture0')).toEqual(i);
    });
    
    it("should activate the textures", function() {
      expect(SPEC_CONTEXT.glActiveTexture).toHaveBeenCalledWith(GL_TEXTURE0);
      expect(SPEC_CONTEXT.glActiveTexture).toHaveBeenCalledWith(GL_TEXTURE1);
    });
    
    it("should bind the textures", function() {
      expect(tex0.bind).toHaveBeenCalledWith(SPEC_CONTEXT, 0);
      expect(tex1.bind).toHaveBeenCalledWith(SPEC_CONTEXT, 1);
    });
    
    it("should set unique texture IDs", function() {
      expect(manifest.getValue('Texture0')).not.toEqual(manifest.getValue('Texture1'));
    });
  });
});