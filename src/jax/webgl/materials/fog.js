Jax.LINEAR = 1;
Jax.EXPONENTIAL = 2;
Jax.EXP2 = 3;

Jax.Material.Fog = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "fog",
      algorithm: Jax.EXP2,
      start: 10.0,
      end: 100.0,
      density: 0.0015,
      color:[1,1,1,1]
    });
    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set('End', this.end);
    uniforms.set('Scale', 1.0 / (this.end - this.start));
    uniforms.set('Algorithm', this.algorithm);
    uniforms.set('Density', this.density);
    uniforms.set('FogColor', this.color);
  }
});
