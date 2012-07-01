Jax.Material.Layer.Picking = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, options) {
    $super({shader:"picking"});
  },
  
  setVariables: function(context, mesh, model, vars) {
    model_index = model.__unique_id;
    if (model_index === undefined) model_index = -1;
    vars.INDEX = model_index;
  }
});
