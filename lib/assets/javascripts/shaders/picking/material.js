Jax.Material.Picking = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"picking"});
  },
  
  setVariables: function(context, mesh, model, vars) {
    model_index = model.__unique_id;
    if (model_index == undefined) model_index = -1;
    vars.set('INDEX', model_index);
  }
});
