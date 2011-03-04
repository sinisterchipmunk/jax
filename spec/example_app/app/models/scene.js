var Scene = Jax.Model.create({
  after_added_to_world: function(world) {
    world.addObject(this.door);
  }
});
