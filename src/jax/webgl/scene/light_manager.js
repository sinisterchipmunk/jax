//= require "light_source"

Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context = context;
      this._lights = [];
      this.objects = [];
    },
    
    addObject: function(obj) {
      this.objects.push(obj);
      for (var j = 0; j < this._lights.length; j++)
        if (obj.isShadowCaster())
          this._lights[j].registerCaster(obj);
      this.recalculateBoundingRadius();
    },
    
    removeObject: function(obj) {
      if (this.objects[obj]) {
        var o = this.objects[obj];
        this.objects.splice(obj, 1);
        for (var j = 0; j < this._lights.length; j++)
          if (o.isShadowCaster())
            this._lights[j].unregisterCaster(o);
        this.recalculateBoundingRadius();
        return o;
      }
      for (var i = 0; i < this.objects.length; i++)
        if (this.objects[i] == obj)
          return this.removeObject(obj);
    },
    
    getShadowCasters: function() {
      var ret = [];
      for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].isShadowCaster())
          ret.push(this.objects[i]);
      }
      return ret;
    },
    
    add: function(light) {
      if (typeof(light) == "string") light = Jax.Scene.LightSource.find(light);
      
      if (this._lights.length == Jax.max_lights)
        throw new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first.");
      for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].isShadowCaster())
          light.registerCaster(this.objects[i]);
      }
      this._lights.push(light);
      light.boundingRadius = this.boundingRadius || 0;
    },
    
    recalculateBoundingRadius: function() {
      var boundingRadius = null;
      var i, j;
      for (i = 0; i < this.objects.length; i++) {
        j = vec3.length(this.objects[i].camera.getPosition()) + this.objects[i].getBoundingSphereRadius();
        if (boundingRadius == null || boundingRadius < j)
          boundingRadius = j;
      }
      this.boundingRadius = boundingRadius = boundingRadius || 0;
      
      for (i = 0; i < this._lights.length; i++)
        this._lights[i].boundingRadius = boundingRadius;
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
    
    illuminate: function(context, options) {
      // used by individual light sources
      options = Jax.Util.normalizeOptions(options, {});
      
      // Use alpha blending for the first pass, and additive blending for subsequent passes.
      this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      for (var i = 0; i < this._lights.length; i++) {
        this._current_light = i;
        this._lights[i].render(context, this.objects, options);
        if (i == 0) this.context.glBlendFunc(GL_ONE, GL_ONE);
      }
      
      delete this._current_light;
    },

    getDirection: function(index) { return this.getLight(index).getDirection(); },
    
    getPosition: function(index) { return this.getLight(index).getPosition(); },
    
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
