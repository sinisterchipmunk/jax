//= require "application_controller"

var NoiseController = (function() {
  return Jax.Controller.create("noise", ApplicationController, {
    index: function() {
      var model = new Jax.Model({mesh:new Jax.Mesh.Sphere({material:Material.find("blob")})});
      this.world.addObject(model);
      this.player.camera.move(-5);
    },

    
    // Some special actions are fired whenever the corresponding input is
    // received from the user.
    mouse_clicked: function(event) {
      
    }
  });
})();
