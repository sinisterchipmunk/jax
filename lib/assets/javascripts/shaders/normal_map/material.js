Jax.Material.NormalMap = Jax.Class.create(Jax.Material, {
  initialize: function($super, map) {
    this.map = Jax.Material.Texture.normalizeTexture(map);
    $super({shader:"normal_map"});
  },
  
  setVariables: function(context, mesh, options, vars) {
    vars.texture('NormalMap', this.map, context);
    vars.set('VERTEX_TANGENT', mesh.getTangentBuffer());
  }
});
