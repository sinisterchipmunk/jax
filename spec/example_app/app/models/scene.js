var Scene = (function() {
  return Jax.Model.create({
    after_added_to_world: function(world) {
      if (this.door)
        world.addObject(this.door);
    }
  });
})();
