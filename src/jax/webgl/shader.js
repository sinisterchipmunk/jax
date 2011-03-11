Jax.Shader = (function() {
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
    
    render: function(context, mesh) {
      if (!this.options) throw new Error("Can't compile shader without shader options");
      if (!this.isCompiledFor(context))
        compile(this, context);
    },
    
    isCompiledFor: function(context) {
      return this.valid[context.id] && !!this.compiled_program[context.id];
    }
  });
})();
