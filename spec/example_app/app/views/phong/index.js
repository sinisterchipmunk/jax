Jax.views.push('phong/index', function() {
  var self = this;

  this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  this.context.pushMatrix(function() {
    mat4.translate(self.context.getModelViewMatrix(), window.light.camera.getPosition());
    window.marker.render(self.context);
  });

  this.world.render();
});
