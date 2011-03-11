//= require "../shader"

/**
 * class Jax.Material
 * 
 * Represents a single material, which has its own color, lighting and texture properties.
 * 
 * Example:
 *     var material = new Jax.Material({ specular:    0,
 *                                       softness:    0.1,
 *                                       glossiness: 10,
 *                                       opacity:     1.0,
 *                                       shaderType: "phong",
 *                                       colors: {
 *                                         diffuse:  [0.8, 0.8, 0.8],
 *                                         ambient:  [0.8, 0.8, 0.8],
 *                                         specular: [1.0, 1.0, 1.0],
 *                                         emissive: [0.0, 0.0, 0.0]
 *                                       }
 *                                     });
 *     material.shaderType = "blinn";
 **/
Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {colors:{}};
    for (var i in self.colors)
      self.previous.colors[i] = self.colors[i];
    self.previous.specular    = self.specular;
    self.previous.glossiness  = self.glossiness;
    self.previous.softness    = self.softness;
    self.previous.shaderType  = self.shaderType;
    self.previous.opacity     = self.opacity;
  }
  
  function compile(self, context) {
    self.shader = new Jax.Shader();
    self.shader.update(self);
    updatePrevious(self);
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = options || {};
      options.colors = options.colors || {};
      
      this.colors = {
        diffuse:  options.colors.diffuse  || [0.8, 0.8, 0.8],
        ambient:  options.colors.ambient  || [0.8, 0.8, 0.8],
        specular: options.colors.specular || [1.0, 1.0, 1.0],
        emissive: options.colors.emissive || [0.0, 0.0, 0.0]
      };
      
      this.specular   = typeof(options.specular)   == "undefined" ?    0    : options.specular;
      this.softness   = typeof(options.softness)   == "undefined" ?    0.1  : options.softness;
      this.glossiness = typeof(options.glossiness) == "undefined" ?   10    : options.glossiness;
      this.opacity    = typeof(options.opacity)    == "undefined" ?    1.0  : options.opacity;
      this.shaderType = typeof(options.shaderType) == "undefined" ? "phong" : options.shaderType;
    },

    /**
     * Jax.Material#render(context, mesh) -> undefined
     * Renders the specified object to the specified context, using this material.
     *
     * This action will build and compile the shader for the given context if necessary.
     **/
    render: function(context, mesh) {
      if (this.isChanged()) compile(this, context);
      this.shader.render(context, mesh);
    },

    /**
     * Jax.Material#isChanged() -> Boolean
     * Returns true if this material's properties have been changed since
     * the last time its internal shader was compiled.
     **/
    isChanged: function() {
      if (!this.previous) return true;
      var i;
      for (i = 0; i < 3; i++) {
        if (this.colors.diffuse[i]  != this.previous.colors.diffuse[i])  return true;
        if (this.colors.ambient[i]  != this.previous.colors.ambient[i])  return true;
        if (this.colors.specular[i] != this.previous.colors.specular[i]) return true;
        if (this.colors.emissive[i] != this.previous.colors.emissive[i]) return true;
      }
      
      if (this.specular   != this.previous.specular)   return true;
      if (this.softness   != this.previous.softness)   return true;
      if (this.glossiness != this.previous.glossiness) return true;
      if (this.shaderType != this.previous.shaderType) return true;
      if (this.opacity    != this.previous.opacity)    return true;
      
      return false;
    }
  });
})();
