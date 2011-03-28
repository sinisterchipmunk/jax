//= require "scene"

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager(context);
      this.objects  = [];
    },
    
    addLightSource: function(light)   { this.lighting.add(light); },
    
    addObject: function(object) { this.objects.push(object); return object; },
    
    getObject: function(index) { return this.objects[index]; },
    
    render: function() {
      var i;
      
      /* this.current_pass is used by the material */
      this.context.current_pass = Jax.Scene.AMBIENT_PASS;
      
      if (this.lighting.isEnabled()) {
        /* ambient pass */
        this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        for (i = 0; i < this.objects.length; i++)
          this.objects[i].render(this.context);
        
        /* illumination pass */
        this.context.current_pass = Jax.Scene.ILLUMINATION_PASS;
        this.context.glBlendFunc(GL_ONE, GL_ONE);
        this.lighting.illuminate(this.context, this.objects);
      } else {
        for (i = 0; i < this.objects.length; i++)
          this.objects[i].render(this.context);
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
