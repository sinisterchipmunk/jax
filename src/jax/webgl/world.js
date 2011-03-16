//= require "scene"

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager();
      this.objects  = [];
    },
    
    addLightSource: function(light)   { this.lighting.add(light); },
    
    addObject: function(object) { this.objects.push(object); },
    
    render: function() {
      for (var i = 0; i < this.objects.length; i++)
        this.objects[i].render(this.context);
    }
  });
})();
