//= require "light_source"

Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context = context;
      this._lights = [];
    },
    
    add: function(light) {
      if (this._lights.length == Jax.max_lights)
        throw new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first.");
      this._lights.push(light);
    },
    
    enable: function() { this.enabled = true; },
    
    disable: function() { this.enabled = false; },
    
    isEnabled: function() {
      if (arguments.length == 1) {
        if (this._lights.length > arguments[0])
          return this._lights[arguments[0]].isEnabled();
        return false;
      }
      
      if (this.enabled != undefined)
        return this.enabled;
      return this._lights.length > 0;
    },
    
    count: function() { return this._lights.length; },
    
    remove: function(index) {
      var result = this._lights.splice(index, 1);
      if (this._lights.length == 0) delete this.enabled;
      return result;
    },
    
    illuminate: function(context, objects) {
      for (var i = 0; i < this._lights.length; i++) {
        this._current_light = i;
        for (var j = 0; j < objects.length; j++) {
          /* TODO optimization: see if objects[j] is even affected by this._lights[i] */
          objects[j].render(context);
        }
      }
      delete this._current_light;
    },
    
    /*
      shading is done in eye space, but the mv matrix represents object space. So if we return the lights
      in world space, they'll be converted to object space. Instead we need to convert the return value to
      a more usable value, such that when it is multiplied by object space, the result is in world space.
     */
    getDirection: function(index) {
      var result = this.getLight(index).getDirection();
      if (this.context) {
        result = mat4.multiplyVec3(this.context.getWorldSpaceMatrix(), result);
      }
      return result;
    },
    
    getPosition: function(index) {
      var result = this.getLight(index).getPosition();
      if (this.context) {
        result = mat4.multiplyVec3(this.context.getWorldSpaceMatrix(), result);
      }
      return result;
    },
    
    getLight: function(index) {
      if (index == undefined)
        if (this._current_light != undefined) return this._lights[this._current_light];
        else return (this.default_light = this.default_light || new Jax.Scene.LightSource());
      return this._lights[index];
    },
    
    getType: function(index) { return this.getLight(index).getType(); },
    
    getDiffuseColor: function(index) { return this.getLight(index).getDiffuseColor(); },
    
    getSpecularColor: function(index) { return this.getLight(index).getSpecularColor(); },
    
    getAmbientColor: function(index) { return this.getLight(index).getAmbientColor(); },
    
    getConstantAttenuation: function(index) { return this.getLight(index).getConstantAttenuation(); },
    
    getLinearAttenuation: function(index) { return this.getLight(index).getLinearAttenuation(); },
                                                                                                                                  
    getQuadraticAttenuation: function(index) { return this.getLight(index).getQuadraticAttenuation(); },
    
    getSpotCosCutoff: function(index) { return this.getLight(index).getSpotCosCutoff(); },
    
    getSpotExponent: function(index) { return this.getLight(index).getSpotExponent(); }
  });
})();
