//= require "application_controller"

var TexturesController = (function() {
  return Jax.Controller.create("textures", ApplicationController, {
    index: function() {
      var tex_mat = Jax.Material.find("bricks");
      
      this.world.addLightSource(Jax.Scene.LightSource.find("textures_point"));
      this.world.addObject(new Jax.Model({position:[0,0,-7.5],mesh: new Jax.Mesh.Quad({size:7.5,material:tex_mat})}));
    },
    
    /* moving the mouse will rotate the object */
    mouse_moved: function(event) {
      var camera = this.world.getObject(0).camera;
      camera.rotate(0.0375, [this.context.mouse.diffy, 0, -this.context.mouse.diffx]);
    },
    
    update: function(tc) {
      var light = this.world.lighting.getLight(0).camera;
      light.p = (light.p || 0) + tc;
      light.setPosition(Math.cos(light.p)*2.5, Math.sin(light.p)*2.5, -6.0);
    }
  });
})();
