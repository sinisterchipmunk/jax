Jax.Scene.LightSource = (function() {
  return Jax.Model.create({
    initialize: function($super, data) {
      data = data || {};
      data.enabled = typeof(data.enabled) == "undefined" ? true : data.enabled;
      data.attenuation           = data.attenuation           || {};
      data.attenuation.constant  = data.attenuation.constant  || 0;
      data.attenuation.linear    = data.attenuation.linear    || 0;
      data.attenuation.quadratic = data.attenuation.quadratic || 0.001;
      data.position = data.position || [0,0,0];
      data.ambient  = data.ambient  || [0,0,0,1];
      data.diffuse  = data.diffuse  || [1,1,1,1];
      data.specular = data.specular || [1,1,1,1];
      
      $super(data);
    },
    
    getDiffuseColor: function() { return this.diffuse; },
    getAmbientColor: function() { return this.ambient; },
    getSpecularColor: function() { return this.specular; },
    getPosition: function() { return this.camera.getPosition(); },
    getConstantAttenuation: function() { return this.attenuation.constant; },
    getQuadraticAttenuation: function() { return this.attenuation.quadratic; },
    getLinearAttenuation: function() { return this.attenuation.linear; },
    isEnabled: function() { return this.enabled; }
  });
})();
