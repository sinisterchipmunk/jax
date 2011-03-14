//= require "scene"

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.lighting = new Jax.Scene.LightManager();
    }
  });
})();
