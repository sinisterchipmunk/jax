//= require "application_controller"

var CourthouseController = (function() {
  return Jax.Controller.create("courthouse", ApplicationController, {
    /* 'index' action. Sets up the scene. 'index' is called by default when first
       switching to this controller, unless another action name is given.
     */
    index: function() {
      World.addLightSource(LightSource.find('sun'));
      World.addObject(Scene.find('courthouse'));
      World.addObject(Character.find('judge'));
    },

    /* Some special actions are fired whenever the corresponding input is
       received from the user.
     */
    mouse_clicked: function(event) {
      if (event.target.isKindOf(Door)) {
        /* user clicks on the door, so they need to go to the next scene */
        redirect_to(event.target.destination);
      }
    },

    /* clean up the scene. Special function which is called when switching
       to a new controller. Generally, World will clean up sufficiently on
       its own.
     */
    destroy: function($super) {
      $super();
    }
  });
})();
