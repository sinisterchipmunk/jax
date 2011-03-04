var CourthouseController = Jax.Controller.create(ApplicationController, {
  /* 'index' action. Sets up the scene. called by default when first
     switching to this controller, unless another action name is given.
  */
  index: function($super) {
    $super();
    World.addLightSource(LightSource.find('sun'));
    World.addObject(Scene.find('courthouse'));
    World.addObject(Character.find('judge'));
  },

  /* clean up the scene. Special function which is called when switching
     to a new controller. Generally, World will clean up sufficiently on
     its own.
  */
  destroy: function($super) {
    $super();
  }
});
