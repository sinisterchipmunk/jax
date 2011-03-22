//= require "../shader"

/**
 * class Jax.Material
 * 
 * Represents a single material, which has its own color, lighting and texture properties.
 * 
 * Example:
 * 
 *     var material = new Jax.Material({ shininess: 1,
 *                                       shaderType: "blinn-phong",
 *                                       diffuse:  [0.8, 0.8, 0.8, 1.0],
 *                                       ambient:  [0.8, 0.8, 0.8, 1.0],
 *                                       specular: [1.0, 1.0, 1.0, 1.0],
 *                                       emissive: [0.0, 0.0, 0.0, 1.0]
 *                                     });
 *     material.shaderType = "blinn";
 **/
Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {};
    self.previous.shininess   = self.shininess;
    self.previous.shaderType  = self.shaderType;
    self.previous.diffuse     = self.diffuse;
    self.previous.ambient     = self.ambient;
    self.previous.specular    = self.specular;
    self.previous.emissive    = self.emissive;
    self.previous.light_count = self.light_count;
    self.previous.lights      = self.lights;
  }
  
  function compile(self, context) {
    self.shader = new Jax.Shader();
    self.shader.update(self);
    updatePrevious(self);
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = options || {};
      
      this.diffuse = options.diffuse  || [0.8, 0.8, 0.8, 1.0];
      this.ambient = options.ambient  || [0.02, 0.02, 0.02, 1.0];
      this.specular = options.specular || [1.0, 1.0, 1.0, 1.0];
      this.emissive = options.emissive || [0.0, 0.0, 0.0, 1.0];      
      this.shininess = typeof(options.shininess) == "undefined" ?   10    : options.shininess;
      this.shaderType = typeof(options.shaderType) == "undefined" ? "blinn-phong" : options.shaderType;
    },

    /**
     * Jax.Material#render(context, mesh) -> undefined
     * Renders the specified object to the specified context, using this material.
     *
     * This action will build and compile the shader for the given context if necessary.
     **/
    render: function(context, mesh, options) {
      this.lights = context.world.lighting._lights;
      this.light_count = context.world.lighting._lights.length;
      
      if (this.isChanged())
        compile(this, context);

      this.shader.render(context, mesh, options);
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
        if (this.diffuse[i]  != this.previous.diffuse[i])  return true;
        if (this.ambient[i]  != this.previous.ambient[i])  return true;
        if (this.specular[i] != this.previous.specular[i]) return true;
        if (this.emissive[i] != this.previous.emissive[i]) return true;
      }
      
      if (this.shininess  != this.previous.shininess)   return true;
      if (this.shaderType != this.previous.shaderType) return true;
      
      if (this.lights && this.lights.length != this.previous.light_count) return true;
      if (!this.lights && this.previous.light_count)   return true;
      
      return false;
    }
  });
})();

Jax.Material.instances = {};

/**
 * Jax.Material.find(name) -> Jax.Material
 * - name (String): the unique name of the material you're looking for
 * 
 * Returns the instance of Jax.Material matching the specified name, or throws
 * an error if the material can't be found.
 **/
Jax.Material.find = function(name) {
  var result;
  if (result = Jax.Material.instances[name])
    return result;
  if (Jax.shader_program_builders[name])
    return Jax.Material.create(name, {shaderType:name});
  throw new Error("Material not found: '"+name+"'!");
};

/**
 * Jax.Material.create(name, options) -> Jax.Material
 * - name (String): the unique name of this material
 * - options (Object): a set of options to be passed to the material constructor
 * 
 * Creates a material and adds it to the material registry. This way,
 * the material can be later retrieved using:
 * 
 *     var matr = Jax.Material.find(name);
 *     
 * Note that unlike instances of Jax.Model, specifying a name for a material that
 * already exists will not raise an error. Instead, the previous material will be
 * replaced with a new material constructed using the new options. This allows you
 * to override Jax defaults like so:
 * 
 *     Jax.Material.create("default", {...});
 *     
 **/
Jax.Material.create = function(name, options) {
  return Jax.Material.instances[name] = new Jax.Material(options);
};

Jax.Material.create('failsafe', {shaderType: 'failsafe'});
Jax.Material.create('default' , {shaderType: 'blinn-phong'});
