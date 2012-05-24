Jax.Material.Texture = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, texture, material) {
    this.texture = Jax.Material.Texture.normalizeTexture(texture);
    $super({shader:"texture"}, material);
  },
  
  setVariables: function(context, mesh, model, vars) {
    vars.texture('Texture', this.texture, context);
    vars.set('TextureScaleX', this.texture.options.scale_x || this.texture.options.scale || 1);
    vars.set('TextureScaleY', this.texture.options.scale_y || this.texture.options.scale || 1);
  }
});

Jax.Material.Texture.normalizeTexture = function(tex) {
  if (tex instanceof Jax.Texture) return tex;
  return new Jax.Texture(tex); 
};
