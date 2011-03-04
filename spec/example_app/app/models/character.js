var Character = Jax.Model.create({
  after_initialize: function() {
    this.setPosition(0, 0, 0);
  },

  /* other Character-specific logic */
  attack: function(target) {
    target.takeDamage(this.damage);
  },

  takeDamage: function(amount) {
    this.hit_points -= amount;
    if (this.hit_points <= 0) {
      throw new Error("Character "+this.name+" died!");
    }
  }
});
