//= require "scene"

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager(context);
      this.objects  = [];
      this.shadow_casters = [];
    },
    
    addLightSource: function(light)   { this.lighting.add(light); },
    
    addObject: function(object) { this.objects.push(object); this.invalidate(); return object; },
    
    getObject: function(index) { return this.objects[index]; },
    
    removeObject: function(object_or_index) {
      if (this.objects[object_or_index]) {
        var obj = this.objects[object_or_index];
        this.objects.splice(object_or_index, 1);
        this.invalidate();
        return obj;
      }
      else
        for (var i = 0; i < this.objects.length; i++)
          if (this.objects[i] == object_or_index)
          {
            this.objects.splice(i, 1);
            this.invalidate();
            return this.objects[i];
          }
    },
    
    countObjects: function() {
      return this.objects.length;
    },
    
    invalidate: function() {
      while (this.shadow_casters.length > 0) {
        /* TODO we still need to unregister the camera event listener */
        this.shadow_casters.pop();
      }
      
      for (var i = 0; i < this.objects.length; i++) {
        var self = this;
        var updated = function() { self.shadowmaps_valid = false; };
        if (this.objects[i].isShadowCaster()) {
          this.objects[i].camera.addEventListener('matrixUpdated', updated);
          this.shadow_casters.push(this.objects[i]);
        }
      }
      this.shadowmaps_valid = false;
    },
    
    getShadowCasters: function() { return this.shadow_casters; },
    
    render: function() {
      var i;
      
      /* this.current_pass is used by the material */

      this.context.current_pass = Jax.Scene.AMBIENT_PASS;
      this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      
      var lit = {default_material:"default"}, unlit = {default_material:"basic"};
      if (this.lighting.isEnabled()) {
        /* ambient pass */
        for (i = 0; i < this.objects.length; i++) {
          if (this.objects[i].lit)
            this.objects[i].render(this.context, lit);
          else this.objects[i].render(this.context, unlit);
        }
      
        /* shadowgen pass */
        this.context.current_pass = Jax.Scene.SHADOWMAP_PASS;
        if (!this.shadowmaps_valid) {
          this.lighting.updateShadowMaps(this.context, this.shadow_casters);
          this.shadowmaps_valid = true;
        }
        
        /* illumination pass */
        this.context.glBlendFunc(GL_ONE, GL_ONE);
        this.context.current_pass = Jax.Scene.ILLUMINATION_PASS;
        this.lighting.illuminate(this.context, this.objects, lit);
      } else {
        for (i = 0; i < this.objects.length; i++)
          this.objects[i].render(this.context, unlit);
      }
    },
    
    update: function(timechange) {
      for (var i = this.objects.length-1; i >= 0; i--)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
    },
      
    dispose: function() {
      var i, o;
      
      for (i = this.objects.length-1; i >= 0; i--)
      /*
        actually, we may not want to dispose the objects just yet. What if the user has a handle to them?
        Maybe better to let JS GC take care of this one.
      */
        (o = this.objects.pop());// && o.dispose();
      
      this.lighting = new Jax.Scene.LightManager(this.context);
    }
  });
})();
