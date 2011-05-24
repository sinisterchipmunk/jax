//= require "application_controller"

var NoiseController = (function() {
  var red, green, blue;
  
  return Jax.Controller.create("noise", ApplicationController, {
    index: function() {
      var model = new Blob();
      this.world.addObject(model);
      this.player.camera.move(-5);
      
      var light_options = {
        type: Jax.POINT_LIGHT,
        attenuation: {
          constant: 0,
          linear: 0,
          quadratic: 0.002
        }
      };
      
      red = new LightSource(Jax.Util.normalizeOptions({
        position: [-20, 0, 20], color: { ambient: [0.2, 0, 0, 1], diffuse: [0.8, 0, 0, 1], specular:[1.0, 0, 0, 1] }
      }, light_options));
      this.world.addLightSource(red);

      green = new LightSource(Jax.Util.normalizeOptions({
        position: [ 20, 20, 20], color: { ambient: [0, 0.2, 0, 1], diffuse: [0, 0.8, 0, 1], specular:[0, 1.0, 0, 1] }
      }, light_options));
       this.world.addLightSource(green);

      blue = new LightSource(Jax.Util.normalizeOptions({
        position: [ 20, -20, 20], color: { ambient: [0, 0, 0.2, 1], diffuse: [0, 0, 0.8, 1], specular:[0, 0, 1.0, 1] }
      }, light_options));
       this.world.addLightSource(blue);
    },
    
    update: function(tc) {
      this.rot = (this.rot || 0) + tc * 3.0;
      
      function set(light, angle) {
        var s = Math.sin(angle), c = Math.cos(angle);
        light.camera.setPosition(s*20, c*20, 20);
      }
      var dif = Math.deg2rad(120);
      set(red, this.rot + dif);
      set(blue, this.rot + dif*2);
      set(green, this.rot + dif*3);
    }
  });
})();
