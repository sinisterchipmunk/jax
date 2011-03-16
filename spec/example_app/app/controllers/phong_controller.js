//= require "application_controller"

/*
  Example of phong shading with arbitrary light sources. Renders a torus with 3 light sources: red, blue and white.
  The white light source will follow the mouse. The mouse can be dragged to move the camera.
 */

var PhongController = (function() {
  return Jax.Controller.create("phong", ApplicationController, {
    /* 'index' action. Sets up the scene. 'index' is called by default when first
       switching to this controller, unless another action name is given.
     */
    index: function() {
      window.mesh = new Jax.Mesh.Torus({inner_radius:0.6, outer_radius:1.8, rings:128, sides:256});
      window.mesh.material = "phong";
      
      window.marker = new Jax.Mesh.Quad(0.5);
      window.marker.material = "color_without_texture";
      
      this.world.addObject(new Jax.Model({mesh: window.mesh}));
      
      this.world.addLightSource(window.light = new Jax.Scene.LightSource({
        enabled:true,
        position:[0,0,1],
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.00275
        },
        ambient: [0,0,0,1],
        diffuse: [0.5,0.5,0.5,1],
        specular: [1,1,1,1]
      }));
      this.world.addLightSource(new Jax.Scene.LightSource({
        enabled:true,
        position:[0,-20,1],
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.00275
        },
        ambient: [0,0,0,1],
        diffuse: [0.9,0.0,0.0,1],
        specular: [0.75,0,0,1]
      }));
      this.world.addLightSource(new Jax.Scene.LightSource({
        enabled:true,
        position:[0,20,1],
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.00275
        },
        ambient: [0,0,0,1],
        diffuse: [0.0,0.0,0.9,1],
        specular: [0,0,0.75,1]
      }));
      
      this.player.camera.move(-10);
    },
    
    mouse_moved: function(event) {
      var obj = this.context.world.lighting.getLight(0);
//      obj.camera.setPosition(vec3.add(obj.camera.getPosition(), [this.context.mouse.diffx, 0, 0]));
//      document.getElementById('jax_banner').innerHTML = (this.context.mouse.diffx+" "+this.context.mouse.diffy);
      this.context.player.camera.rotate(this.context.mouse.diffy/50, 1, 0, 0);
      this.context.player.camera.rotate(this.context.mouse.diffx/50, 0, 1, 0);
    },
    
    mouse_dragged: function(event) {
      this.context.player.camera.move(0.25, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
