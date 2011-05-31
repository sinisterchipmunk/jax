//= require "application_controller"

/*
  Example of blinn-phong shading with arbitrary light sources. Renders a teapot with 3 light sources:
  red, blue and white. The white light source is a spotlight and will pivot back and forth over a 90-degree angle
  with the teapot in the center. The mouse can be moved to move the camera, or dragged to move the teapot.
 */

var LightingController = (function() {
  return Jax.Controller.create("lighting", ApplicationController, {
    index: function() {
      // build a new material, since the default one isn't quite to our liking for this demo
      // all unspecified options will simply inherit the default ones.
      var custom_material = Jax.Material.find("lighting_with_shadows");
      
      // add a Teapot
      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Teapot({size:10, material:custom_material}),position:[0,0,-25] }));
      this.world.addObject(new Jax.Model({ mesh: new Jax.Mesh.Plane({size:75, material:custom_material}), position:[0,-15,-50],direction:[0,1,0]}));
      
      // add a spotlight, like a flashlight -- we'll animate this later
      this.world.addLightSource(Jax.Scene.LightSource.find("spot_light"));
      this.world.addObject(new Jax.Model({mesh:new Jax.Mesh.Sphere({color:[0.5,0.5,0.5,1]}), shadow_caster: false, lit:false, position:[0,0,30]}));
      
      // add a point light, like a candle
      var point_light = Jax.Scene.LightSource.find("point_light");
      this.world.addLightSource(point_light);
      this.world.addObject(new Jax.Model({mesh:new Jax.Mesh.Sphere({color:[0.5,0,0,1]}), shadow_caster: false, lit:false, position:point_light.getPosition()}));
      
      // add a directional light, like the sun
      this.world.addLightSource(Jax.Scene.LightSource.find("directional_light"));
      
      // position the player backwards 20 units, to [0,0,20].
      this.player.camera.setPosition(0,15,50);
      this.player.camera.lookAt([0,0,0],[0,1,0]);
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
    
    /* moving the mouse will pan the camera */
    mouse_moved: function(event) {
      var camera = this.context.player.camera;
      camera.move(0.175, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    },
    
    /* dragging the mouse will pan the object */
    mouse_dragged: function(event) {
      var camera = this.world.getObject(0).camera;
      camera.move(0.175, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
