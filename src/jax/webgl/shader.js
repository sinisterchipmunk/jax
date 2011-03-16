Jax.Shader = (function() {
  function getNormalizedAttribute(self, name) {
    if (!self.attributes) throw new Error("Attributes are undefined!");
    if (!self.attributes[name]) throw new Error("Attribute '"+name+"' is not registered!");
    
    switch(typeof(self.attributes[name])) {
      case 'object':
//        if (!self.attributes[name].name) self.attributes[name] = { value: self.attributes[name] };
        break;
      default:
        self.attributes[name] = { value: self.attributes[name] };
    }
    self.attributes[name].name = self.attributes[name].name || name;
    self.attributes[name].locations = self.attributes[name].locations || {};
    
    return self.attributes[name];
  }
  
  function getNormalizedUniform(self, name) {
    if (!self.uniforms) throw new Error("Uniforms are undefined!");
    if (!self.uniforms[name]) throw new Error("Uniform '"+name+"' is not registered!");
    
    switch(typeof(self.uniforms[name])) {
      case 'object':
//        if (!self.uniforms[name].name) self.uniforms[name] = { value: self.uniforms[name] };
        break;
      default:
        self.uniforms[name] = { value: self.uniforms[name] };
    }
    self.uniforms[name].name = self.uniforms[name].name || name;
    self.uniforms[name].locations = self.uniforms[name].locations || {};
    
    return self.uniforms[name];
  }
  
  function getUniformLocation(self, context, uniform) {
    if (typeof(uniform.locations[context.id]) != "undefined") return uniform.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetUniformLocation(program, uniform.name);
    if (location == -1 || location == null)
      return null;
//      throw new Error("Uniform location for uniform '"+uniform.name+"' could not be found!");
    return uniform.locations[context.id] = location;
  }
  
  function getAttributeLocation(self, context, attribute) {
    if (typeof(attribute.locations[context.id]) != "undefined") return attribute.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetAttribLocation(program, attribute.name);
    if (location == -1 || location == null) throw new Error("Attribute location for attribute '"+attribute.name+"' could not be found!");
    return attribute.locations[context.id] = location;
  }
  
  function compile(self, context) {
    var shaderType = self.options.shaderType;
    
    var builder = Jax.shader_program_builders[self.options.shaderType];
    if (!builder) throw new Error("Could not find shader builder: "+shaderType);
    var sources = builder(self.options);
    if (!sources.vertex_source)   throw new Error("Shader builder '"+shaderType+"' did not return a 'vertex_source' property");
    if (!sources.fragment_source) throw new Error("Shader builder '"+shaderType+"' did not return a 'fragment_source' property");
    
    if (sources.vertex_source.join)   sources.vertex_source   = sources.vertex_source.join("\n");
    if (sources.fragment_source.join) sources.fragment_source = sources.fragment_source.join("\n");
    
    sources.fragment_source = "#ifdef GL_ES\nprecision highp float;\n#endif\n" + sources.fragment_source;
    
    self.uniforms   = sources.uniforms;
    self.attributes = sources.attributes;
    
    function doCompile(type, source) {
      var shader = context.glCreateShader(type);
      context.glShaderSource(shader, source);
      context.glCompileShader(shader);
      if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
        throw new Error(context.glGetShaderInfoLog(shader));
      return shader;
    }
    
    var fragmentShader = doCompile(GL_FRAGMENT_SHADER, sources.fragment_source);
    var vertexShader   = doCompile(GL_VERTEX_SHADER,   sources.vertex_source);
    var program = context.glCreateProgram();
    
    if (vertexShader)   context.glAttachShader(program, vertexShader);
    if (fragmentShader) context.glAttachShader(program, fragmentShader);
    context.glLinkProgram(program);
    
    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!");
    
    self.compiled_program[context.id] = program;
    self.valid[context.id] = true;
  }
  
  return Jax.Class.create({
    initialize: function() {
      this.compiled_program = {};
      this.valid = {};
    },
    
    update: function(options) {
      this.options = options;
      for (var i in this.valid) this.valid[i] = false; // invalidate all contexts
    },
    
    render: function(context, mesh, options) {
      if (!this.options) throw new Error("Can't compile shader without shader options");
      if (!this.isCompiledFor(context))
        compile(this, context);
      
      var id;
      context.glUseProgram(this.compiled_program[context.id]);
      for (id in this.attributes) this.setAttribute(context, mesh, getNormalizedAttribute(this, id));
      for (id in this.uniforms)   this.setUniform(  context, mesh, getNormalizedUniform(this, id));
      
      var buffer;
      if (buffer = mesh.getIndexBuffer())
        context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
      else if (buffer = mesh.getVertexBuffer())
        context.glDrawArrays(options.draw_mode, 0, buffer.length);
    },
    
    setAttribute: function(context, mesh, attribute) {
      var value = attribute.value;
      if (typeof(value) == "function") value = value(context, mesh);
      if (value == null || typeof(value) == "undefined") return this.disableAttribute(context, attribute);
      var location = getAttributeLocation(this, context, attribute);
      
      value.bind(context);
      context.glEnableVertexAttribArray(location);
      context.glVertexAttribPointer(location, value.itemSize, attribute.type || value.type || GL_FLOAT, false, 0, 0);
    },
    
    setUniform: function(context, mesh, uniform) {
      var value = uniform.value;
      if (typeof(value) == "function") value = value.call(uniform, context, mesh);

      var location = getUniformLocation(this, context, uniform);
      if (!location) return;
      
      /* TODO perhaps we should only do this matching in development mode. Can it happen in prod? */
      var match;
      if (Object.isArray(value) && (match = /([0-9]+)fv$/.exec(uniform.type)) && (match = match[1]))
      {
        // make sure array matches item count
        if (match != (value.itemSize ? value.length / value.itemSize : value.length))
          throw new Error("Value "+JSON.stringify(value)+" has "+value.length+" elements (expected "+match+")");
      }
      
      if (value == null || typeof(value) == "undefined")
        throw new Error("Value is undefined or null for uniform '"+uniform.name+"'!");
      
      if (!context[uniform.type]) throw new Error("Invalid uniform type: "+uniform.type);
      if (uniform.type.indexOf("glUniformMatrix") != -1) context[uniform.type](location, false, value);
      else                                               context[uniform.type](location,        value);
    },
    
    disableAttribute: function(context, attribute) {
      context.glDisableVertexAttribArray(getAttributeLocation(this, context, attribute));
    },
    
    isCompiledFor: function(context) {
      return this.valid[context.id] && !!this.compiled_program[context.id];
    }
  });
})();
