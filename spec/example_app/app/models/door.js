var Door = Jax.Model.create({
  after_initialize: function() { },

  /* user clicks on the door, so they need to go to the next scene */
  onclick: function(evt) {
    redirect_to(this.destination);
  }
});
