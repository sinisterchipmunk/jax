Jax.Material.Picking = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"picking"});
  },
  
  setVariables: function(context, mesh, options, vars) {
    model_index = options.model_index;
    if (model_index == undefined) model_index = -1;

    vars.set('INDEX', model_index);
  }
});
