Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this._lights = [];
    },
    
    isEnabled: function() {
      if (arguments.length == 1) {
        if (this._lights.length > arguments[0]) return this._lights[arguments[0]].isEnabled();
        return false;
      }
      return this._lights.length > 0;
    },
    
    getDiffuseColor: function(lightIndex) { return [1,1,1,1]; },
    
    getSpecularColor: function(lightIndex) { return [1,1,1,1]; },
    
    getAmbientColor: function(lightIndex) { return [1,1,1,1]; },
    
    getPosition: function(lightIndex) { return [0,0,0]; },
    
    getConstantAttenuation: function(lightIndex) { return 0; },
    
    getLinearAttenuation: function(lightIndex) { return 0; },
    
    getQuadraticAttenuation: function(lightIndex) { return 0; }
    
  });
})();
