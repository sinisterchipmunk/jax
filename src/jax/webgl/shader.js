Jax.Shader = (function() {
  function buildStackTrace(context, glShader, source) {
    source = source.split(/\n/);
    var log = context.glGetShaderInfoLog(glShader).split(/\n/);
    
    /* build a detailed backtrace with error information so devs can actually find the error */
    var current = 1, injected = [], li;
    function strToInject() { return current+" : "+source[current-1]; }
    for (li = 0; li < log.length; li++) {
      var line = log[li];
      var match = /0:(\d+):(.*)/.exec(line);
      if (!match) continue; // blank line
      var line_number = parseInt(match[1]);
      if (line_number > current)
        for (; current < line_number; current++)
          injected.push(strToInject());
      if (line_number == current) {
        injected.push(strToInject());
        injected.push(":: ERROR : "+match[2]); /* error message */
      }
      current = line_number+1;
    }
    
    /* prepend a summary so user can debug simple errors at a glance */
    injected.unshift("");
    for (li = log.length-1; li >= 0; li--)
      injected.unshift(log[li]);
        
    /* finally, add 3 more lines so the user has an easier time finding the problem in ambiguous code */
    li = current;
    for (current = li; current < li+3; current++)
      injected.push(strToInject());
        
    return injected.join("\n");
  }
  
  function compile(context, shader, source) {
    context.glShaderSource(shader, source);
    context.glCompileShader(shader);
    if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
      throw new Error(buildStackTrace(context, shader, source));
  }
  
  return Jax.Class.create({
    /*
      setup: function(context, mesh, options, attributes, uniforms)
      common: source inserted into both shaders
      vertex: vertex shader source
      fragment: fragment shader source
      name: shader name
     */
    initialize: function(obj) {
      if (obj.vertex)   obj.vertex   = new EJS({text:obj.vertex});
      if (obj.fragment) obj.fragment = new EJS({text:obj.fragment});
      if (obj.common)   obj.common   = new EJS({text:obj.common});
      
      this.options = obj;
      this.shaders = { vertex: {}, fragment: {} };
    },
    
    getName: function() { return this.options.name; },
    
    getVertexShader: function(context) {
      if (!this.options.vertex) return null;
      this.shaders.vertex[context.id] = this.shaders.vertex[context.id] || context.glCreateShader(GL_VERTEX_SHADER);
      return this.shaders.vertex[context.id];
    },
    
    getFragmentShader: function(context) {
      if (!this.options.fragment) return null;
      this.shaders.fragment[context.id] = this.shaders.fragment[context.id] || context.glCreateShader(GL_FRAGMENT_SHADER);
      return this.shaders.fragment[context.id];
    },
    
    getCommonSource: function(material) {
      return this.options.common ? this.options.common.render(material) : "";
    },
    
    getVertexSource: function(material) {
      return this.options.vertex && (this.getCommonSource(material)+this.options.vertex.render(material));
    },
    
    getFragmentSource: function(material) {
      var defs = "#ifdef GL_ES\nprecision highp float;\n#endif\n";
      return this.options.fragment && (defs+this.getCommonSource(material)+this.options.fragment.render(material));
    },
    
    build: function(context, material) {
      var count = 0;
      if (this.getVertexShader(context)) {
        count++;
        compile(context, this.getVertexShader(context), this.getVertexSource(material));
      }
      if (this.getFragmentShader(context)) {
        count++;
        compile(context, this.getFragmentShader(context), this.getFragmentSource(material));
      }
      if (count == 0) throw new Error("No sources specified for shader '"+this.getName()+"'!");
    }
  });
})();

Jax.Shader.Delegator = (function() {
  return Jax.Class.create({
    initialize: function(context, program, variables) {
      this.context = context;
      this.program = program;
      this.variables = variables;
    }
  });
})();

Jax.Shader.AttributeDelegator = (function() {
  return Jax.Class.create(Jax.Shader.Delegator, {
    initialize: function($super, context, program) {
      var numAttributes = context.glGetProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
      var attributes = {};
      for (var i = 0; i < numAttributes; i++)
      {
        var attrib = context.glGetActiveAttrib(program, i);
        attributes[attrib.name] = {
          length:attrib.length,
          size:attrib.size,
          type:attrib.type,
          type_str:Jax.Util.enumName(attrib.type),
          location: context.glGetAttribLocation(program, attrib.name)
        };
      }
      $super(context, program, attributes);
    },
    
    set: function(name, value) {
      var v, c = this.context, i, variables = this.variables;
      
      function _set(name, value) {
        if (value == undefined) return;
//        if (value == undefined) throw new Error("Value is undefined for shader attribute "+JSON.stringify(name));
        
        if (v = variables[name]) {
          value.bind(c);
          c.glEnableVertexAttribArray(v.location);
          c.glVertexAttribPointer(v.location, value.itemSize, GL_FLOAT, false, 0, 0);
        } else {
          console.warn("skipping assignment of attribute %s (variables: %s)", name, JSON.stringify(variables));
        }
      }
      
      if (arguments.length == 1 && typeof(arguments[0]) == "object")
        for (i in arguments[0])
          _set(i, arguments[0][i]);
      else
        for (i = 0; i < arguments.length; i += 2)
          _set(arguments[i], arguments[i+1]);
    },
    
    disableAll: function() {
      for (var v in this.variables) {
        v = this.variables[v];
        this.context.glDisableVertexAttribArray(v.location);
      }
    }
  });
})();

Jax.Shader.UniformDelegator = (function() {
  return Jax.Class.create(Jax.Shader.Delegator, {
    initialize: function($super, context, program) {
      var numUniforms = context.glGetProgramParameter(program, GL_ACTIVE_UNIFORMS);
      var uniforms = {};
      for (var i = 0; i < numUniforms; i++)
      {
        var unif = context.glGetActiveUniform(program, i);
        uniforms[unif.name] = {
          length:unif.length,
          size:unif.size,
          type:unif.type,
          type_str:Jax.Util.enumName(unif.type),
          location: context.glGetUniformLocation(program, unif.name)
        };
      }
      $super(context, program, uniforms);
    },
    
    set: function(name, value) {
      var variables = this.variables, v, c = this.context, i;
      
      function _set(name, value) {
        if (value == undefined) throw new Error("Value is undefined for shader uniform "+JSON.stringify(name));
        
        if (v = variables[name]) {
          try {
            switch(v.type) {
              case GL_FLOAT:
                value.length != undefined ? c.glUniform1fv(v.location, value) : c.glUniform1f(v.location, value);
                break;
              case GL_BOOL: // same as int
              case GL_INT:
                value.length != undefined ? c.glUniform1iv(v.location, value) : c.glUniform1i(v.location, value);
                break;
              case GL_FLOAT_VEC2:   c.glUniform2fv(v.location, value); break;
              case GL_FLOAT_VEC3:   c.glUniform3fv(v.location, value); break;
              case GL_FLOAT_VEC4:   c.glUniform4fv(v.location, value); break;
              case GL_FLOAT_MAT2:   c.glUniformMatrix2fv(v.location, false, value); break;
              case GL_FLOAT_MAT3:   c.glUniformMatrix3fv(v.location, false, value); break;
              case GL_FLOAT_MAT4:   c.glUniformMatrix4fv(v.location, false, value); break;
              case GL_BOOL_VEC2:    // same as int
              case GL_INT_VEC2:     c.glUniform2iv(v.location, value); break;
              case GL_BOOL_VEC3:    // same as int
              case GL_INT_VEC3:     c.glUniform3iv(v.location, value); break;
              case GL_BOOL_VEC4:    // same as int
              case GL_INT_VEC4:     c.glUniform4iv(v.location, value); break;
              case GL_SAMPLER_2D:   c.glUniform1i(v.location, value); break;
              case GL_SAMPLER_CUBE: c.glUniform1i(v.location, value); break;
              default:
                throw new Error("Unexpected attribute type: "+v.type+" ("+JSON.stringify(v)+")");
            }
          } catch(e) {
            alert("Failed to set uniform for "+name+' ('+value+"):\n\n"+e+"\n\n"+e.stack);
            throw e;
          }
        }
      }
      
      if (arguments.length == 1 && typeof(arguments[0]) == "object")
        for (i in arguments[0])
          _set(i, arguments[0][i]);
      else
        for (i = 0; i < arguments.length; i += 2)
          _set(arguments[i], arguments[i+1]);
    }
  });
})();


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
  
  function linkProgram(self, context, material, program) {
    /* really attach those shaders that we've pretended to have attached already */
    for (var i = 0; i < self.shaders.length; i++) {
      var shader = self.shaders[i];
      var vert = shader.getVertexShader(context),
          frag = shader.getFragmentShader(context);
        
      if (vert) {
        program.vertex = true;
        context.glAttachShader(program, vert);
      }
      if (frag) {
        program.fragment = true;
        context.glAttachShader(program, frag);
      }
    }

    if (!program.vertex || !program.fragment)
      throw new Error("Attempted to link program missing either a vertex or fragment shader! " +
                      "(WebGL requires at least 1 of each.)");
    
    buildShaderSources(self, context, material);
    context.glLinkProgram(program);
    
    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!");
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
    
    render: function(context, mesh, material, options) {
      var program = this.getGLProgram(context);
      
      if (!program.linked) 
        linkProgram(this, context, material, program);
      
      context.glUseProgram(program);
      
      this.getAttributeDelegator(context, program).disableAll();
      if (Jax.shaders.setup)
        Jax.shaders.setup(context, mesh, material, options, this.getAttributeDelegator(context, program),
                this.getUniformDelegator(context, program));
      
      try {
        var buffer;
        if (buffer = mesh.getIndexBuffer()) {
          buffer.bind(context);
          context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
        }
        else if (buffer = mesh.getVertexBuffer())
          context.glDrawArrays(options.draw_mode, 0, buffer.length);
      } catch(e) {
        var shaderNames = [];
        for (var i = 0; i < this.shaders.length; i++) shaderNames[i] = this.shaders[i].getName();
        var message = "Fatal error encountered while drawing mesh:\n\n"+e+"\n\nShaders: "+shaderNames;
        alert(message);
        console.error(message);
        throw e;
      }
    },
    
    getGLProgram: function(context) { return getShaderProgram(this, context); },
    getAttributeDelegator: function(context) { return this.attribute_delegator[context.id]; },
    getUniformDelegator: function(context) { return this.uniform_delegator[context.id]; }
  });
})();