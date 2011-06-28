//= require "application_controller"

var TexturesController = (function() {
  var movement = { forward: 0, backward: 0, left: 0, right: 0 };
  
  return Jax.Controller.create("textures", ApplicationController, {
    index: function() {
      var tex_mat = Jax.Material.find("bricks");
      
      this.world.addLightSource(Jax.Scene.LightSource.find("textures_point"));
      this.world.addObject(new Jax.Model({position:[0,0,-7.5],mesh: new Jax.Mesh.Quad({size:7.5,material:tex_mat})}));
    },
    
    key_pressed: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_W: movement.forward = 1; break;
        case KeyEvent.DOM_VK_S: movement.backward = -1; break;
        case KeyEvent.DOM_VK_A: movement.left = -1; break;
        case KeyEvent.DOM_VK_D: movement.right = 1; break;
      }
    },

    key_released: function(event) {
      switch(event.keyCode) {
        case KeyEvent.DOM_VK_W: movement.forward = 0; break;
        case KeyEvent.DOM_VK_S: movement.backward = 0; break;
        case KeyEvent.DOM_VK_A: movement.left = 0; break;
        case KeyEvent.DOM_VK_D: movement.right = 0; break;
      }
    },

    mouse_moved: function(event) {
      this.player.camera.pitch(0.01*event.diffy);
      this.player.camera.yaw(-0.01*event.diffx);
    },
    
    mouse_dragged: function(event) {
      var camera = this.world.getObject(0).camera;
      camera.pitch( 0.0375*event.diffy);
      camera.pitch(-0.0375*event.diffx);
    },
    
    update: function(tc) {
      var speed = 1.5 * tc;
      this.player.camera.move((movement.forward + movement.backward) * speed);
      this.player.camera.strafe((movement.left + movement.right) * speed);

      var light = this.world.lighting.getLight(0).camera;
      light.p = (light.p || 0) + tc;
      light.setPosition(Math.cos(light.p)*2.5, Math.sin(light.p)*2.5, -6.0);
    }
  });
})();
