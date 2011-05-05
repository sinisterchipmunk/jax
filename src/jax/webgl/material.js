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
  
  return Jax.Class.create({
    initialize: function(options) {
      options = Jax.Util.normalizeOptions(options, {
        diffuse: [0.8, 0.8, 0.8, 1.0],
        ambient: [0.02, 0.02, 0.02, 1.0],
        specular: [1.0, 1.0, 1.0, 1.0],
        emissive: [0, 0, 0, 1.0],
        shininess: 10,
        default_shader: options && options.name || Jax.default_shader
      });

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
      this.shader_variable_prefix = chain.addShader(this.shader || this.default_shader);
      for (var i = 0; i < this.layers.length; i++)
        this.layers[i].addShadersToChain(chain);
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
    
    setUniforms: function(context, mesh, options, uniforms) {
      uniforms.variable_prefix = this.shader_variable_prefix;
      var light = context.world.lighting.getLight();
      
      uniforms.set({
        mMatrix: context.getModelMatrix(),
        vnMatrix: mat3.transpose(mat4.toMat3(context.getViewMatrix())),
        ivMatrix: context.getInverseViewMatrix(),
        vMatrix: context.getViewMatrix(),
        mvMatrix: context.getModelViewMatrix(),
        pMatrix: context.getProjectionMatrix(),
        nMatrix: context.getNormalMatrix(),
    
        materialAmbient: this.ambient,
        materialDiffuse: this.diffuse,
        materialSpecular: this.specular,
        materialShininess: this.shininess,
    
        PASS_TYPE: context.current_pass,
        
        'LIGHT.position': light.getPosition(),
        'LIGHT.direction': light.getDirection(),
        'LIGHT.ambient': light.getAmbientColor(),
        'LIGHT.diffuse': light.getDiffuseColor(),
        'LIGHT.specular': light.getSpecularColor(),
        'LIGHT.constant_attenuation': light.getConstantAttenuation(),
        'LIGHT.linear_attenuation': light.getLinearAttenuation(),
        'LIGHT.quadratic_attenuation': light.getQuadraticAttenuation(),
        'LIGHT.spotExponent': light.getSpotExponent(),
        'LIGHT.spotCosCutoff': light.getSpotCosCutoff(),
        'LIGHT.enabled': light.isEnabled(),
        'LIGHT.type': light.getType()
      });

      for (var i = 0; i < this.layers.length; i++) {
        uniforms.variable_prefix = this.layers[i].shader_variable_prefix;
        this.layers[i].setUniforms(context, mesh, options, uniforms);
      }
    },
    
    setAttributes: function(context, mesh, options, attributes) {
      attributes.variable_prefix = this.shader_variable_prefix;
      attributes.set('VERTEX_POSITION',  mesh.getVertexBuffer() || null);
      attributes.set('VERTEX_COLOR',     mesh.getColorBuffer() || null);
      attributes.set('VERTEX_NORMAL',    mesh.getNormalBuffer() || null);
      attributes.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer() || null);

      for (var i = 0; i < this.layers.length; i++) {
        attributes.variable_prefix = this.layers[i].shader_variable_prefix;
        this.layers[i].setAttributes(context, mesh, options, attributes);
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
      
      var shader = this.prepareShader(context);
      
      shader.render(context, mesh, this, options);
    },
    
    /**
     * Jax.Material#isChanged() -> Boolean
     * Returns true if this material's properties have been changed since
     * the last time its internal shader was compiled.
     **/
    isChanged: function() {
      if (!this.previous) return true;

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

//= require "materials/texture"
//= require "materials/normal_map"
//= require "materials/shadow_map"
//= require "materials/dual_paraboloid"
//= require "materials/fog"

Jax.Material.create("basic");
Jax.Material.create("default", {default_shader:'basic'});
Jax.Material.create("depthmap", {default_shader:"depthmap"});
Jax.Material.create("paraboloid-depthmap", {type:"DualParaboloid",default_shader:"paraboloid-depthmap"});
