Jax.Material.Noise = (function() {
  function getNoise(self, context) {
    var noise = self.noise[context.id];
    if (!noise) noise = self.noise[context.id] = new Jax.Noise(context);
    return noise;
  }
  
  return Jax.Class.create(Jax.Material, {
    initialize: function($super, options) {
      this.noise = {};
      
      options = Jax.Util.normalizeOptions(options, {
        shader: "blob",

        // You can specify default options (see +manifest.yml+) here.
      });

      $super(options);
    },
  
    setUniforms: function($super, context, mesh, options, uniforms) {
      this.l = this.l || new Date().getTime();
      var tc = (new Date().getTime() - this.l) / 1000;

      var noise = getNoise(this, context);
    
      $super(context, mesh, options, uniforms);

      uniforms.texture('permTexture', noise.perm, context);
      uniforms.texture('simplexTexture', noise.simplex, context);
      uniforms.texture('gradTexture', noise.grad, context);
    
      uniforms.set('time', tc);
    }
  });
})();
