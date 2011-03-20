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

      /* light sources */
      var light01 = new Jax.Scene.LightSource({
        enabled:true,
        type: Jax.SPOT_LIGHT,
        angle: 20.0,
        position: [0,150,150],
//        direction: [],
        ambient: [0,0,0,1],
        diffuse: [1,1,1,1],
        specular: [1,1,1,1],
        attenuation: {
          constant: 0,
          linear: 0.01,
          quadratic: 0.00001
        }
      });
      
      this.world.addLightSource(light01);
      
      /* materials */
      var floor_mat = new Jax.Material({
        shaderType: "phong",
        colors: {
          glossiness: 60,
          ambient: [0.7,0.7,0.7,1],
          diffuse: [0.4,0.9,0.4,1],
          specular: [0.4,0.4,0.4,1]
        }
      });
      
      var torus_mat = new Jax.Material({
        shaderType: "phong",
        specular: 60,
        colors: {
          ambient: [0.3,0.3,0.3,1],
          diffuse: [0.9,0.5,0.5,1],
          specular:[0.6,0.6,0.6,1]
        }
      });
      
      var sphere_mat = new Jax.Material({
        shaderType: "phong",
        specular: 60,
        colors: {
          ambient: [0.3,0.3,0.3,1],
          diffuse: [0.5,0.5,0.9,1],
          specular:[0.4,0.4,0.4,1]
        }
      });

      /* objects */
      this.world.addObject(new Jax.Model({mesh: new Jax.Mesh.Plane({size:500,segments:20,material:floor_mat})}));
      
      var torus = new Jax.Model({mesh:new Jax.Mesh.Torus({outer_radius:60,inner_radius:32,material:torus_mat})});
      torus.camera.orient(0,-1,0,  0,0,1);
      torus.camera.setPosition(-70,50,0);
      this.world.addObject(torus);
      
      var sphere = new Jax.Model({mesh: new Jax.Mesh.Sphere({radius:40,stacks:40,slices:40,material:sphere_mat})});
      sphere.camera.setPosition(70, 40, 0);
      this.world.addObject(sphere);

      /* camera */
      this.player.camera.setPosition(30, 100, 200);
      this.player.camera.lookAt([0,0,0], [0,1,0]);
    },
    
    update: function(timechange) {
      // let's rotate the light's camera
      
    },
    
    mouse_moved: function(event) {
      var obj = this.context.world.lighting.getLight(0);
//      obj.camera.setPosition(vec3.add(obj.camera.getPosition(), [this.context.mouse.diffx, 0, 0]));
//      document.getElementById('jax_banner').innerHTML = (this.context.mouse.diffx+" "+this.context.mouse.diffy);
      this.context.player.camera.rotate( this.context.mouse.diffy/50, 1, 0, 0);
      this.context.player.camera.rotate(-this.context.mouse.diffx/50, 0, 1, 0);
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
