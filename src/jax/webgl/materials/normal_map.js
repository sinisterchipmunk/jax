Jax.Material.NormalMap = Jax.Class.create(Jax.Material, {
  initialize: function($super, map) {
    this.map = map;
    $super({shader:"normal_map"});
  },
  
  setAttributes: function($super, context, mesh, options, attributes) {
    $super(context, mesh, options, attributes);
    attributes.set('VERTEX_TANGENT', mesh.getTangentBuffer());
  }
});
