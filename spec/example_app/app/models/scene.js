/**
 * class Scene < Jax.Model
 * 
 */
var Scene = (function() {
  return Jax.Model.create({
    after_initialize: function() {
      /* if this.door exists, it's currently the ID of an actual Door instance. We want the instance itself. */
      /* TODO add some belongs_to/has_many/has_one/etc relationships to handle finding instances automatically */
      if (this.door)
        this.door = Door.find(this.door);
    },
    
    after_added_to_world: function(world) {
      if (this.door)
        world.addObject(this.door);
    }
  });
})();
