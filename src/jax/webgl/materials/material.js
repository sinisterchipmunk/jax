//= require "../shader"

/**
 * class Jax.Material
 * 
 * Represents a single material, which has its own color, lighting and texture properties.
 * 
 * Example:
 * 
 *     var material = new Jax.Material({ shininess: 1,
 *                                       diffuse:  [0.8, 0.8, 0.8, 1.0],
 *                                       ambient:  [0.8, 0.8, 0.8, 1.0],
 *                                       specular: [1.0, 1.0, 1.0, 1.0],
 *                                       emissive: [0.0, 0.0, 0.0, 1.0]
 *                                     });
 *                                     
 * IMPORTANT: Note that shaders are no longer directly tied to a given Material. Instead, the shader
 * should be specified as a property (or render option) of the mesh to be rendered. In most cases,
 * however, the appropriate shader will be determined automatically by Jax.
 **/
Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {};
    self.previous.shininess   = self.shininess;
    self.previous.shader      = self.shader;
    self.previous.diffuse     = self.diffuse;
    self.previous.ambient     = self.ambient;
    self.previous.specular    = self.specular;
    self.previous.emissive    = self.emissive;
    self.previous.light_count = self.light_count;
    self.previous.lights      = self.lights;
    self.previous.texture_count = self.textures.length;
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = Jax.Util.normalizeOptions(options, {
        diffuse: [0.8, 0.8, 0.8, 1.0],
        ambient: [0.02, 0.02, 0.02, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        emissive: [0, 0, 0, 1.0],
        shininess: 10,
        default_shader: "basic"
      });
      
      this.name = options.name || options.shader || options.default_shader;
//      if (!this.name) throw new Error("Jax.Material should at least have a {name} option");
      
      var i;
      for (i in options)
        this[i] = options[i];
      
      this.shaders = {};

      this.textures = [];
      if (this.texture) {
        this.textures.push(new Jax.Texture(this.texture));
        delete this.texture;
      } else if (options.textures) {
        for (i = 0; i < options.textures.length; i++) {
          this.textures.push(new Jax.Texture(options.textures[i]));
        }
      }
    },

    /**
     * Jax.Material#buildShader(name) -> Jax.Shader
     * 
     * Forces a rebuild of the specified shader. If the shader doesn't exist, one will be instantiated.
     * Note that this doesn't result in an immediate recompile (as that would require a Jax.Context).
     * Instead, it schedules the rebuild for the next render pass, when the Jax.Context is readily
     * available.
     **/
    buildShader: function(name) {
      if (!this.shaders[name]) this.shaders[name] = new Jax.Shader(name);
      this.shaders[name].update(this);
      return this.shaders[name];
    },
    
    /**
     * Jax.Material#updateModifiedShaders() -> self
     * 
     * If this Material has been modified, all shaders attached to it will be rebuilt.
     **/
    updateModifiedShaders: function() {
      if (this.isChanged()) {
        for (var s in this.shaders)
          this.buildShader(s);
        updatePrevious(this);
      }
      return this;
    },

    /**
     * Jax.Material#prepareShader(name) -> Jax.Shader
     * 
     * Prepares the specified shader for rendering. If this Material has been modified,
     * then all shaders are updated. The specified shader is either built or returned,
     * depending on whether it has already been built.
     **/
    prepareShader: function(name) {
      var shader;
      
      if (this.shaders[name])
        shader = this.shaders[name];
      else
        shader = this.buildShader(name);

      this.updateModifiedShaders();
      return shader;
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
      
      var shader = this.prepareShader((options && options.shader || this.shader) ||
                                      (options && options.default_shader|| this.default_shader));

      shader.render(context, mesh, options);
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
      if (this.shader != this.previous.shader) return true;
      
      if (this.lights && this.lights.length != this.previous.light_count) return true;
      if (!this.lights && this.previous.light_count)   return true;
      
      if (this.textures.length != this.previous.texture_count) return true;
      
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
//  if (Jax.shader_program_builders[name])
//    return Jax.Material.create(name, {shader:name});
  throw new Error("Material {material:'"+name+"'} could not be found. "+
                  "Perhaps you meant to use {shader:'"+name+"'} instead?");
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
  options = Jax.Util.normalizeOptions(options, {
    name: name,
    shader: name
  });
  return Jax.Material.instances[name] = new Jax.Material(options);
};

Jax.Material.create('failsafe');
Jax.Material.create("basic");
Jax.Material.create('default');
