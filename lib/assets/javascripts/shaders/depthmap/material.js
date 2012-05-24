Jax.Material.Depthmap = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, options, material) {
    $super({shader:"depthmap"}, material);
  }
});
