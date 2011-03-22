//= require "application_controller"

/*
  Example of phong shading with arbitrary light sources. Renders a torus with 3 light sources: red, blue and white.
  The white light source will follow the mouse. The mouse can be dragged to move the camera.
 */

var PhongController = (function() {
  return Jax.Controller.create("phong", ApplicationController, {
    index: function() {
      var custom_material = new Jax.Material({shininess:128,ambient:[0.05,0.05,0.05,1]});
      
      this.world.addObject(new Jax.Model({
        mesh: new Jax.Mesh.Teapot({size:10, material:custom_material})
//      mesh: new Jax.Mesh.Torus({inner_radius:0.6, outer_radius:1.8, rings:128, sides:256, material:custom_material});
      }));
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        enabled:true,
        position:[0,0,50],
        direction:[0,0,-1],
        attenuation: {
          constant:  0,
          linear:    0.02,
          quadratic: 0
        },
        type: Jax.SPOT_LIGHT,
        spotExponent: 64,
        angle: Math.PI/6,
        color: {
          ambient: [0.15,0.15,0.15,1],
          diffuse: [0.75,0.75,0.5,1],
          specular: [1,1,1,1]
        }
      }));
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        enabled:true,
        position:[-20,0,0],
        type: Jax.POINT_LIGHT,
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.00275
        },
        color: {
          ambient: [0,0,0,1],
          diffuse: [0.9,0.0,0.0,1],
          specular: [0.75,0,0,1]
        }
      }));
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        enabled:true,
        position:[0,20,1],
        direction:[-1,-1,0],
        type: Jax.DIRECTIONAL_LIGHT,
        attenuation: {
          constant: 1,
          linear: 0,
          quadratic: 0
        },
        color: {
          ambient: [0,0,0,1],
          diffuse: [0.0,0.0,0.9,1],
          specular: [0,0,0.75,1]
        }
      }));
      
      this.player.camera.move(-20);
    },
    
    update: function(timechange) {
      var lt = this.context.world.lighting.getLight(0);

      this.rotation_per_second = this.rotation_per_second || Math.PI/4; // 45 degrees per second
      this.tracker = this.tracker || 0;
      this.tracker++;
      
      if (this.tracker > 3) {
        // see if it's time to reverse direction. dot of normals is cos, and cos of 45 degrees is sqrt(2)/2.
        // (remember, 45 degrees in either direction results in a total of 90 degrees before changing direction)
        // one vector is simply the light's view vector. The other, since this is all based on the teapot, is simply
        // the difference between the light's position and the teapot's position, normalized.
        var vec1 = vec3.normalize(vec3.subtract(this.world.getObject(0).camera.getPosition(), lt.camera.getPosition()));
        var vec2 = lt.camera.getViewVector();
        var dot = vec3.dot(vec1, vec2);
        if (dot < Math.sqrt(2)/2)
        {
          this.rotation_per_second = -this.rotation_per_second;
          this.tracker = 0; // tracker helps keep the light from getting "stuck" by forcing a wait of 3 intervals
        }
      }

      // rotate the spotlight. Just like any other object, a light has its own camera, so it's trivial to orient
      // it within the scene.
      lt.camera.rotate(this.rotation_per_second*timechange, 0, 1, 0); // causes spotlight to spin horizontally
    },
    
    mouse_moved: function(event) {
      var camera = this.world.getObject(0).camera;
      
      // for mouselook
//      camera = this.context.player.camera;
      
      camera.rotate( this.context.mouse.diffy/75, 1, 0, 0);
      camera.rotate(-this.context.mouse.diffx/75, 0, 1, 0);
    },
    
    mouse_dragged: function(event) {
      this.context.player.camera.move(0.175, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
