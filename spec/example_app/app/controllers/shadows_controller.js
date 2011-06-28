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
      /* light sources */
      var light01 = new Jax.Scene.LightSource({
        enabled:true,
        type: Jax.POINT_LIGHT,
        angle: 20.0,
        position: [0,150,150],
        direction: [-1,-1,-1],
        color: {
          ambient: [0,0,0,1],
          diffuse: [1,1,1,1],
          specular: [1,1,1,1]
        },
        attenuation: {
          constant: 0,
          linear: 0.01,
          quadratic: 0.00001
        }
      });
      
      this.world.addLightSource(light01);
      
      /* materials */
      var floor_mat = new Jax.Material({
        shaderType: "blinn-phong",
        shininess: 60,
        ambient: [0.1,0.1,0.1,1],
        diffuse: [0.4,0.9,0.4,1],
        specular: [0.4,0.4,0.4,1]
      });
      floor_mat.addLayer(new Jax.Material.Lighting());
      floor_mat.addLayer(new Jax.Material.ShadowMap());
      
      var torus_mat = new Jax.Material({
        shaderType: "blinn-phong",
        shininess: 60,
        ambient: [0.1,0.1,0.1,1],
        diffuse: [0.9,0.3,0.3,1],
        specular:[0.6,0.6,0.6,1]
      });
      torus_mat.addLayer(new Jax.Material.Lighting());
      torus_mat.addLayer(new Jax.Material.ShadowMap());
      
      var sphere_mat = new Jax.Material({
        shaderType: "blinn-phong",
        shininess: 60,
        ambient: [0.1,0.1,0.1,1],
        diffuse: [0.3,0.3,0.9,1],
        specular:[0.4,0.4,0.4,1]
      });
      sphere_mat.addLayer(new Jax.Material.Lighting());
      sphere_mat.addLayer(new Jax.Material.ShadowMap());

      /* objects */
      this.world.addObject(new Jax.Model({mesh: new Jax.Mesh.Plane({size:500,segments:20,material:floor_mat})}));
      
      var torus = new Jax.Model({mesh:new Jax.Mesh.Torus({outer_radius:60,inner_radius:32,material:torus_mat})});
      // torus.camera.orient(0,-1,0,  0,0,1);
      torus.camera.reorient([0, -1, 0], [-70, 50, 0]);
      // torus.camera.setPosition(-70,50,0);
      this.world.addObject(torus);
      
      var sphere = new Jax.Model({mesh: new Jax.Mesh.Sphere({radius:40,stacks:40,slices:40,material:sphere_mat})});
      sphere.camera.setPosition(70, 40, 0);
      this.world.addObject(sphere);

      /* camera */
      this.player.camera.perspective({width:this.context.canvas.width,height:this.context.canvas.height,far:2000});
      this.player.camera.setPosition(30, 500, 400);
      this.player.camera.lookAt([0,0,0]);//, [0,1,0]);
    },
    
    /*
    TODO delegation
    delegate getLight() into world.lighting
    delegate model setPosition() and friends into model.camera
     */
    
    update: function(timechange) {
      // let's rotate the light's camera
      var light = this.world.lighting.getLight(0);
      var rot = light.rotation || 0;
      rot += Math.PI / 4 * timechange;
      light.rotation = rot;
      var length = vec3.length([0,75,75]);
      light.camera.setPosition(Math.cos(rot)*length, 150, Math.sin(rot)*length);
      light.camera.lookAt([0, 0, 0]);
    },
    
    mouse_moved: function(event) {
      var obj = this.context.world.lighting.getLight(0);
//      obj.camera.setPosition(vec3.add(obj.camera.getPosition(), [this.context.mouse.diffx, 0, 0]));
//      document.getElementById('jax_banner').innerHTML = (this.context.mouse.diffx+" "+this.context.mouse.diffy);
      this.context.player.camera.pitch(this.context.mouse.diffy/50);
      this.context.player.camera.yaw(-this.context.mouse.diffx/50);
    },
    
    mouse_clicked: function(event) {
//      var lt = this.context.world.lighting.getLight(0);
//      switch(lt.type) {
//        case Jax.POINT_LIGHT:
//          lt.type = Jax.SPOT_LIGHT;
//          break;
//        case Jax.SPOT_LIGHT:
//          lt.type = Jax.DIRECTIONAL_LIGHT;
//          break;
//        case Jax.DIRECTIONAL_LIGHT:
//          lt.type = Jax.POINT_LIGHT;
//          break;
//        default:
//          alert("unexpected light type: "+lt.type);
//      }
    },
    
    mouse_dragged: function(event) {
      this.context.player.camera.move(0.25 *  event.diffy);
      this.context.player.camera.strafe(0.25 * event.diffx);
    }
  });
})();
