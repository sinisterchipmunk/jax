Jax.Material.Picking = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"picking"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    model_index = options.model_index;
    if (model_index == undefined) model_index = -1;

    uniforms.set('INDEX', model_index);
  }
});
