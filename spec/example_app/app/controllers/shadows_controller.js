//= require "application_controller"

/*
  Example of shadows cast using phong shading and point, directional and spot lights.
  A single light exists and its type can be toggled by clicking on the canvas. The light
  will constantly be changing direction, though this should be unnoticeable for the
  point light, which always emits in all directions.
  
  WORK IN PROGRESS
*/

var ShadowsController = (function() {
  return Jax.Controller.create("shadows", ApplicationController, {
    index: function() {
      alert("Shadowcasting: WORK IN PROGRESS");
      
      window.mesh = new Jax.Mesh.Torus({inner_radius:0.6, outer_radius:1.8, rings:128, sides:256});
      
      this.world.addObject(new Jax.Model({mesh: window.mesh}));
      
      this.world.addLightSource(window.light = new Jax.Scene.LightSource({
        enabled:true,
        position:[0,0,1],
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.00275
        },
        type: Jax.SPOT_LIGHT,
        ambient: [0,0,0,1],
        diffuse: [0.5,0.5,0.5,1],
        specular: [1,1,1,1]
      }));
      
      this.player.camera.move(-10);
    },
    
    mouse_moved: function(event) {
      var obj = this.context.world.lighting.getLight(0);
//      obj.camera.setPosition(vec3.add(obj.camera.getPosition(), [this.context.mouse.diffx, 0, 0]));
//      document.getElementById('jax_banner').innerHTML = (this.context.mouse.diffx+" "+this.context.mouse.diffy);
    },
    
    mouse_clicked: function(event) {
      switch(window.light.type) {
        case Jax.POINT_LIGHT:
          window.light.type = Jax.SPOT_LIGHT;
          break;
        case Jax.SPOT_LIGHT:
          window.light.type = Jax.DIRECTIONAL_LIGHT;
          break;
        case Jax.DIRECTIONAL_LIGHT:
          window.light.type = Jax.POINT_LIGHT;
          break;
        default:
          alert("unexpected light type: "+window.light.type);
      }
    },
    
    mouse_dragged: function(event) {
      this.context.player.camera.move(0.25, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
