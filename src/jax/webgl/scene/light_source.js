Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

Jax.Scene.LightSource = (function() {
  return Jax.Model.create({
    initialize: function($super, data) {
      data = data || {};
      data.attenuation = data.attenuation || {};
      data.color = data.color || {};

      function default_field(name, value, obj) {
        obj = obj || data;
        if (typeof(obj[name]) == "undefined")
          obj[name] = value;
      }
      
      default_field('enabled', true);
      default_field('type', Jax.POINT_LIGHT);
      default_field('ambient', [0,0,0,1], data.color);
      default_field('diffuse', [1,1,1,1], data.color);
      default_field('specular', [1,1,1,1],data.color);
      default_field('position', [0,0,0]);
      default_field('direction', [-1,-1,-1]);
      default_field('angle', Math.PI/6);
      default_field('spotExponent', 0);
      default_field('constant', 0, data.attenuation);
      default_field('linear', 0.02, data.attenuation);
      default_field('quadratic', 0, data.attenuation);
      
      $super(data);
    },
    
    getPosition: function() { return this.camera.getPosition(); },
    getDirection: function() { return this.camera.getViewVector(); },

    isEnabled: function() { return this.enabled; },
    getType: function() { return this.type; },

    getDiffuseColor: function() { return this.color.diffuse; },
    getAmbientColor: function() { return this.color.ambient; },
    getSpecularColor: function() { return this.color.specular; },
    getConstantAttenuation: function() { return this.attenuation.constant; },
    getQuadraticAttenuation: function() { return this.attenuation.quadratic; },
    getLinearAttenuation: function() { return this.attenuation.linear; },
    getAngle: function() { return this.angle; },
    getSpotExponent: function() { return this.spotExponent; },
    getSpotCosCutoff: function() { return Math.cos(this.angle); }
  });
})();
