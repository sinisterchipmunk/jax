Jax.Material.Texture = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = texture;
    $super({shader:"texture"});
  }
});
