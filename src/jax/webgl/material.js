//= require "shader"

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
    self.previous = self.previous || {subshaders:[]};
    for (var i = 0; i < self.layers.length; i++)
      self.previous.subshaders[i] = self.layers[i].getName();
  }
  
  function instantiate_layer(options) {
    if (options.isKindOf && options.isKindOf(Jax.Material))
      return options;
    else {
      if (options.type) {
        var klass = Jax.Material[options.type];
        if (!klass) throw new Error("Could not find material layer type: "+options.type);
        delete options.type;
        return new klass(options);
      }
      else
        throw new Error("Could not create layer: property 'type' was missing!");
    }
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = Jax.Util.normalizeOptions(options, {
        ambient: [1,1,1,1],
        diffuse: [1,1,1,1],
        specular:[1,1,1,1],
        emissive: [0, 0, 0, 1.0],
        shininess: 10,
        default_shader: Jax.default_shader
      });
      options.ambient = Jax.Util.colorize(options.ambient);
      options.diffuse = Jax.Util.colorize(options.diffuse);
      options.specular = Jax.Util.colorize(options.specular);
      options.emissive = Jax.Util.colorize(options.emissive);

      for (var i in options) { this[i] = options[i]; }
      this.option_properties = Jax.Util.properties(options);
      this.protected_properties = ['name', 'shader', 'default_shader', 'shaders', 'layers'];
      
      this.name = options.name || options.shader || options.default_shader;
      this.shaders = {};
      this.layers = [];

      var tex;
      if (options.texture) {
        tex = new Jax.Texture(options.texture);
        this.addTextureLayer(tex);
        delete options.texture;
      } else if (options.textures) {
        for (i = 0; i < options.textures.length; i++) {
          tex = new Jax.Texture(options.textures[i]);
          this.addTextureLayer(tex);
        }
        delete options.textures;
      }
      
      if (options.layers) {
        for (i = 0; i < options.layers.length; i++) {
          this.addLayer(instantiate_layer(options.layers[i]));
        }
      }
    },
    
    /**
     * Jax.Material#supportsLighting() -> Boolean
     *
     * Returns true if this material supports lighting effects.
     **/
    supportsLighting: function() {
      if (this.getName() == "lighting")
        return true;
      for (var i = 0; i < this.layers.length; i++)
        if (this.layers[i].getName() == "lighting")
          return true;
      return false;
    },
    
    getName: function() { return this.name; },
    
    addTextureLayer: function(tex) {
      var mat;
      switch(tex.options.type) {
        case Jax.NORMAL_MAP:
          mat = new Jax.Material.NormalMap(tex);
          break;
        default:
          mat = new Jax.Material.Texture(tex);
      }
      this.addLayer(mat);
    },
    
    addLayer: function(layer) {
      if (!layer.option_properties) layer = instantiate_layer(layer);
      this.layers.push(layer);

      for (var i = 0; i < layer.option_properties.length; i++) {
        var name = layer.option_properties[i];
        if (this.protected_properties.indexOf(name) == -1 && this[name] == undefined) {
          this[name] = layer[name];
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
    buildShader: function() {
      if (this.shaderChain)
        this.shaderChain.removeAllShaders();
      else
        this.shaderChain = new Jax.ShaderChain(this.getName());
      
      this.addShadersToChain(this.shaderChain);

      return this.shaderChain;
    },
    
    addShadersToChain: function(chain) {
      this.shader_variable_prefix = chain.addShader(this.getBaseShader());
      for (var i = 0; i < this.layers.length; i++)
        this.layers[i].addShadersToChain(chain);
    },
    
    getBaseShader: function() {
      return (this.shader || this.default_shader);
    },
    
    /**
     * Jax.Material#updateModifiedShaders() -> self
     * 
     * If this Material has been modified, all shaders attached to it will be rebuilt.
     **/
    updateModifiedShaders: function() {
      if (this.isChanged()) {
        this.buildShader();
        updatePrevious(this);
      }
      return this;
    },

    /**
     * Jax.Material#prepareShader(name) -> Jax.Shader
     * 
     * Prepares the specified shader for rendering. If this Material has been modified,
     * then all related shaders are updated. The specified shader is either built or returned,
     * depending on whether it has already been built.
     **/
    prepareShader: function() {
      var shader;
      
      if (this.shaderChain) shader = this.shaderChain;
      else shader = this.buildShader();
      
      this.updateModifiedShaders();
      return shader;
    },
    
    setUniforms: function(context, mesh, options, uniforms) {},
    setAttributes: function(context, mesh, options, attributes) { },
    
    setShaderVariables: function(context, mesh, options, manifest) {
      manifest.variable_prefix = this.shader_variable_prefix;

      manifest.set({
        mMatrix: context.getModelMatrix(),
        vnMatrix: mat3.transpose(mat4.toMat3(context.getViewMatrix())),
        ivMatrix:  context.getInverseViewMatrix(),
        vMatrix:   context.getViewMatrix(),
        mvMatrix:  context.getModelViewMatrix(),
        pMatrix:   context.getProjectionMatrix(),
        nMatrix:   context.getNormalMatrix(),
        
        PASS_TYPE: context.current_pass,
        
        materialAmbient: this.ambient,
        materialDiffuse: this.diffuse,
        materialSpecular: this.specular,
        materialShininess: this.shininess
      });
      manifest.set('VERTEX_POSITION',  mesh.getVertexBuffer() || null);
      manifest.set('VERTEX_COLOR',     mesh.getColorBuffer() || null);
      manifest.set('VERTEX_NORMAL',    mesh.getNormalBuffer() || null);
      manifest.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer() || null);

      
      this.setUniforms(context, mesh, options, manifest);
      this.setAttributes(context, mesh, options, manifest);

      for (var i = 0; i < this.layers.length; i++) {
        manifest.variable_prefix = this.layers[i].shader_variable_prefix;
        this.layers[i].setUniforms(context, mesh, options, manifest);
        this.layers[i].setAttributes(context, mesh, options, manifest);
      }
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
      
      try {
        var shader = this.prepareShader(context);
        
        shader.render(context, mesh, this, options);
      } catch(error) {
        if (error instanceof RangeError) {
          // we've hit hardware limits. Back off a layer. If we are down to no layers, raise a coherent error.
          if (this.layers.length > 0) {
            this.adaptShaderToHardwareLimits(shader, error);
            this.render(context, mesh, options);
          }
          else throw error;
        }
        else throw error;
      }
    },
    
    adaptShaderToHardwareLimits: function(shader, error) {
      function log(msg) {
        if (window.console)
          console.log(msg);
        else
          setTimeout(function() { throw new Error(msg); }, 1);
      }
            
      log("WARNING: Hardware limits reached for material '"+this.getName()+"'! (original message: "+error+")");
      
      /*
        choose which shader(s) to remove. We know off the bat that we can remove any shaders which would
        push us over the threshold on their own (e.g. not combined with any except 'basic'), so let's remove
        those first.
      */
      
      var map = shader.getPerShaderInputMap(this);
      
      var uniformsRemaining = Jax.Shader.max_uniforms - map[this.getBaseShader()].uniforms.length;
      var varyingsRemaining = Jax.Shader.max_varyings - map[this.getBaseShader()].varyings.length;
      var attributesRemaining = Jax.Shader.max_attributes - map[this.getBaseShader()].attributes.length;
      
      // we'll use these to determine if we *still* need to pop at the end.
      var totalUniformsInUse = 0, totalVaryingsInUse = 0, totalAttributesInUse = 0;
      
      for (var i = 0; i < this.layers.length; i++) {
        var entry = map[this.layers[i].getBaseShader()];

        if (entry.uniforms.length > uniformsRemaining || entry.varyings.length > varyingsRemaining ||
                entry.attributes.length > attributesRemaining)
        {
          log("WARNING: Removing shader '"+this.layers[i].getName()+"' due to hardware limitations!");
          this.layers.splice(i, 1);
          i = 0;
        } else {
          totalUniformsInUse += entry.uniforms.length;
          totalVaryingsInUse += entry.varyings.length;
          totalAttributesInUse += entry.attributes.length;
        }
      }
      
      if (totalUniformsInUse > uniformsRemaining || totalVaryingsInUse > varyingsRemaining ||
              totalAttributesInUse > attributesRemaining)
      {
        log("WARNING: Removing shader '"+this.layers[this.layers.length-1].getName()+"' due to hardware limitations!");
        this.layers.pop();
      }
    },
    
    /**
     * Jax.Material#isChanged() -> Boolean
     * Returns true if this material's properties have been changed since
     * the last time its internal shader was compiled.
     **/
    isChanged: function() {
      if (!this.previous) return true;

      if (this.previous.subshaders.length != this.layers.length) return true;
      
      for (var i = 0; i < this.layers.length; i++)
        if (this.previous.subshaders[i] != this.layers[i].getName())
          return true;

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
  throw new Error("Material {material:'"+name+"'} could not be found.");
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
  options = Jax.Util.normalizeOptions(options, { name: name });
  
  var klass = Jax.Material;
  if (options.type) klass = klass[options.type];
  
  if (!klass) throw new Error("Material type '"+options.type+"' not found!");
  return Jax.Material.instances[name] = new klass(options);
};

/**
 * Jax.Material.all() -> Array
 * 
 * Returns an array containing the names of all Materials currently registered
 * with Jax. Note that this does not include one-off materials created directly,
 * for example, using "new Jax.Material()".
 **/
Jax.Material.all = function() {
  return Jax.Util.properties(Jax.Material.instances);
};

Jax.Material.addResources = function(resources) {
  for (var i in resources) {
    if (Jax.Material.instances[i]) throw new Error("Duplicate material resource ID: "+i);
    Jax.Material.create(i, resources[i]);
  }
};

//= require "../../../builtin/shaders/texture/material"
//= require "../../../builtin/shaders/normal_map/material"
//= require "../../../builtin/shaders/shadow_map/material"
//= require "../../../builtin/shaders/depthmap/material"
//= require "../../../builtin/shaders/paraboloid/material"
//= require "../../../builtin/shaders/fog/material"
//= require "../../../builtin/shaders/picking/material"

Jax.Material.create("basic");
Jax.Material.create("default", {default_shader:'basic'});
Jax.Material.create("depthmap", {default_shader:"depthmap"});
Jax.Material.create("paraboloid-depthmap", {type:"Paraboloid",default_shader:"paraboloid",layers:[{type:"Depthmap"}]});
Jax.Material.create("picking", {type:"Picking"});
