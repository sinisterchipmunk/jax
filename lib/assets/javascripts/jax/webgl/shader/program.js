//= require "jax/webgl/shader/delegator/attribute"
//= require "jax/webgl/shader/delegator/uniform"
//= require "jax/webgl/shader/manifest"

Jax.Shader.Program = (function() {
  function buildShaderSources(self, context, material) {
    for (var i = 0; i < self.shaders.length; i++) {
      self.shaders[i].build(context, material);
    }
  }
  
  function getShaderProgram(self, context) {
    if (self.programs[context.id]) return self.programs[context.id];
    return self.programs[context.id] = context.glCreateProgram();
  }
  
  function addToVariableList(self, delegator) {
    for (var name in delegator.variables) {
      self.variable_names.push(name);
    }
  }
  
  function updateVariableList(self, context) {
    while (self.variable_names.length > 0) self.variable_names.pop();
    addToVariableList(self, self.getAttributeDelegator(context));
    addToVariableList(self, self.getUniformDelegator(context));
  }
  
  function linkProgram(self, context, material, program) {
    /* really attach those shaders that we've pretended to have attached already */
    for (var i = 0; i < self.shaders.length; i++) {
      var shader = self.shaders[i];
      var vert = shader.getVertexShader(context),
          frag = shader.getFragmentShader(context);
      
      if (vert) {
        program.vertex = vert;
        program.vertex_shader = vert;
        context.glAttachShader(program, vert);
      }
      if (frag) {
        program.fragment = true;
        program.fragment_shader = frag;
        context.glAttachShader(program, frag);
      }
    }

    if (!program.vertex || !program.fragment)
      throw new Error("Attempted to link program missing either a vertex or fragment shader! " +
                      "(WebGL requires at least 1 of each.)");
    
    buildShaderSources(self, context, material);
    context.glLinkProgram(program);
    
    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!\n\n"+context.glGetProgramInfoLog(program));
    else program.linked = true;
    
    context.glUseProgram(program);

    self.attribute_delegator[context.id] = new Jax.Shader.AttributeDelegator(context, program);
    self.uniform_delegator[context.id] = new Jax.Shader.UniformDelegator(context, program);
  }
  
  return Jax.Class.create({
    initialize: function() {
      this.shaders = [];
      this.programs = {};
      this.attribute_delegator = {};
      this.uniform_delegator = {};
      this.variable_names = [];
      this.manifest = new Jax.Shader.Manifest(this.variable_names);
    },
    
    attach: function(shaderName, context) {
      if (!context) throw new Error("No context!");
      var shader = Jax.shaders[shaderName];
      if (!shader)
        throw new Error("Could not find shader named '"+shaderName+"'! " +
                        "Does it exist in Jax.shaders?");
      this.shaders.push(shader);
    },
    
    invalidate: function() {
      for (var i in this.programs)
        this.programs[i].linked = false;
    },
    
    link: function(context, material) {
      var program = this.getGLProgram(context);
      
      if (!program.linked)
        linkProgram(this, context, material, program);
      
      // update list of variable names
      updateVariableList(this, context);
      
      return program;
    },
    
    setShaderVariables: function(context, mesh, material, options) {
      material.setShaderVariables(context, mesh, options, this.manifest);
      this.manifest.apply(this.getUniformDelegator(context), this.getAttributeDelegator(context));
    },
    
    render: function(context, mesh, material, options) {
      var program = this.link(context, material);
      
      context.glUseProgram(program);
      
      this.setShaderVariables(context, mesh, material, options);
      
      try {
        var buffer;
        if ((buffer = mesh.getIndexBuffer()) && buffer.length > 0) {
          buffer.bind(context);
          context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
        }
        else if ((buffer = mesh.getVertexBuffer()) && buffer.length > 0) {
          context.glDrawArrays(options.draw_mode, 0, buffer.length);
        }
      } catch(e) {
        var error = new Error("Fatal error encountered while drawing mesh:\n\n"+e+"\n\nShaders: "+this.getShaderNames());
        Jax.reraise(e, error);
      }
    },
    
    getShaderNames: function() {
      var shaderNames = [];
      for (var i = 0; i < this.shaders.length; i++) shaderNames[i] = this.shaders[i].getName();
      return shaderNames;
    },
    
    getGLProgram: function(context) { return getShaderProgram(this, context); },
    getAttributeDelegator: function(context) { return this.attribute_delegator[context.id]; },
    getUniformDelegator: function(context) { return this.uniform_delegator[context.id]; }
  });
})();