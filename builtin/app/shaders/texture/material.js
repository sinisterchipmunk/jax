Jax.Material.Texture = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = Jax.Material.Texture.normalizeTexture(texture);
    $super({shader:"texture"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('Texture', this.texture, context);
    uniforms.set('TextureScaleX', this.texture.options.scale_x || this.texture.options.scale || 1);
    uniforms.set('TextureScaleY', this.texture.options.scale_y || this.texture.options.scale || 1);
  }
});

Jax.Material.Texture.normalizeTexture = function(tex) {
  if (tex.isKindOf && tex.isKindOf(Jax.Texture)) return tex;
  return new Jax.Texture(tex); 
};
