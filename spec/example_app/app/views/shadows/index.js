Jax.views.push('shadows/index', function() {
  var self = this;

  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.world.render();
});
