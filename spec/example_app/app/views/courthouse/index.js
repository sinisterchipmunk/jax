Jax.views.push('courthouse/index', function() {
  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.player.camera.look();
  this.world.render();
});
