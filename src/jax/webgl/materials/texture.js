Jax.Material.Texture = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = texture;
    $super({shader:"texture"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('Texture', this.texture, context);
    if (this.texture.options.scale != undefined) {
      uniforms.set('TextureScaleX', this.texture.options.scale);
      uniforms.set('TextureScaleY', this.texture.options.scale);
    }
  }
});
