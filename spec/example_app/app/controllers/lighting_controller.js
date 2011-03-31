//= require "application_controller"

/*
  Example of blinn-phong shading with arbitrary light sources. Renders a teapot with 3 light sources:
  red, blue and white. The white light source is a spotlight and will pivot back and forth over a 90-degree angle
  with the teapot in the center. The mouse can be moved to rotate the teapot, or dragged to pan the camera.
 */

var LightingController = (function() {
  return Jax.Controller.create("lighting", ApplicationController, {
    index: function() {
      // build a new material, since the default one isn't quite to our liking for this demo
      // all unspecified options will simply inherit the default ones.
      var custom_material = new Jax.Material({shininess:128,ambient:[0.05,0.05,0.05,1]});
      
      // add a Teapot
      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Teapot({size:10, material:custom_material}) }));
      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Quad({size:80, material:custom_material}), position:[0,0,-15]}));
      
      // add a spotlight, like a flashlight -- we'll animate this later
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
      
      // add a point light, like a candle
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
      
      // add a directional light, like the sun
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
      
      // position the player backwards 20 units, to [0,0,20].
      this.player.camera.move(-20);
    },
    
    /* this updater will take care of pivoting the spotlight horizontally over time. */
    update: function(timechange) {
      var spotlight = this.context.world.lighting.getLight(0);
      var speed = Math.PI/4; // pivot at a speed of 45 degrees per second
      var rotation_direction = this.rotation_per_second || speed;

      // see if it's time to reverse direction. A camera's view vector has magnitude 1. Remember your
      // unit circles? When magnitude is 1, X is cos. The cos of 45 degrees is sqrt(2)/2. So to pivot every
      // 45 degrees off from the focal point (for a total of 90 degrees difference), we'll check X <=> sqrt(2)/2.
      var view = spotlight.camera.getViewVector();
      if (view[0] > Math.sqrt(2)/2)       this.rotation_per_second =  speed;
      else if (view[0] < -Math.sqrt(2)/2) this.rotation_per_second = -speed;

      // rotate the spotlight. Just like any other object, a light has its own camera, so it's trivial to orient
      // it within the scene. Rotating about the Y axis causes a horizontal movement.
      spotlight.camera.rotate(rotation_direction*timechange, 0, 1, 0);
    },
    
    /* moving the mouse will rotate the object in place */
    mouse_moved: function(event) {
      var camera = this.world.getObject(0).camera;
      
      // uncomment to enable mouselook -- this would rotate the user's "head" instead of the object itself
//      camera = this.context.player.camera;
      
      camera.rotate( this.context.mouse.diffy/75, 1, 0, 0);
      camera.rotate(-this.context.mouse.diffx/75, 0, 1, 0);
    },
    
    /* dragging the mouse will move the camera forward or sideways relative to its current orientation */
    mouse_dragged: function(event) {
      this.context.player.camera.move(0.175, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
