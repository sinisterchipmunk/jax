Jax.Material.NormalMap = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, map, material) {
    this.map = Jax.Material.Texture.normalizeTexture(map);
    $super({shader:"normal_map"}, material);
  },
  
  setVariables: function(context, mesh, model, vars) {
    vars.texture('NormalMap', this.map, context);
    vars.set('VERTEX_TANGENT', mesh.getTangentBuffer());
  }
});
