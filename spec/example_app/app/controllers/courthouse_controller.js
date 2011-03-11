//= require "application_controller"

var CourthouseController = (function() {
  return Jax.Controller.create("courthouse", ApplicationController, {
    /* 'index' action. Sets up the scene. 'index' is called by default when first
       switching to this controller, unless another action name is given.
     */
    index: function() {
      this.world.addLightSource(LightSource.find('sun'));
      this.world.addObject(Scene.find('courthouse'));
      this.world.addObject(Character.find('judge'));
    },

    /* Some special actions are fired whenever the corresponding input is
       received from the user.
     */
    mouse_clicked: function(event) {
      if (event.target.isKindOf(Door)) {
        /* user clicks on the door, so they need to go to the next scene */
        this.redirectTo(event.target.destination);
      }
    }
  });
})();
