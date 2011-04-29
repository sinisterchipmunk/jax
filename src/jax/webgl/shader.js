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
  
  function getExportedVariableName(exportPrefix, name) {
    return "_"+exportPrefix+"_"+name;
  }
  
  /*
    preprocess shader source code to replace "import(varname, expression)" with the globalized varname if it's been
    exported (as an attribute of material.exports || self.options.exports), or expression if it hasn't.
   */
  function applyImports(self, material, source) {
    var rx = /import\((.*?), (.*?)\)/, result;
    var exp;
    while (result = rx.exec(source)) {
      var name = result[1];
      if (material && (exp = (material.exports && material.exports[name]) || (self.options.exports && self.options.exports[name]))) {
        var exportedVariableName = getExportedVariableName(material.export_prefix || self.getName(), name);
        source = source.replace(result[0], result[2].replace(new RegExp(name, "g"), exportedVariableName));
      }
      else source = source.replace(result[0], "");
    }
    return source;
  }
  
  function mangleUniformsAndAttributes(self, material, source) {
    var map = self.getInputMap(material);
    for (var name in map)
      source = source.replace(new RegExp("(^|[^a-zA-Z0-9])"+name+"([^a-zA-Z0-9]|$)", "g"), "$1"+map[name]+"$2");
    
    // remove the "shared" directive
    return source.replace(/(^|[^\w])shared\s+/g, "$1");
  }
  
  function preprocess(self, material, source) {
    source = applyImports(self, material, source);
    source = mangleUniformsAndAttributes(self, material, source);
    return source;
  }
  
  return Jax.Class.create({
    initialize: function(obj) {
      this.options = obj;
      
      if (obj.vertex)   this.setRawSource(obj.vertex,   'vertex');
      if (obj.fragment) this.setRawSource(obj.fragment, 'fragment');
      if (obj.common)   this.setRawSource(obj.common,   'common');
      
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
      var source = this.getRawSource(material, 'vertex');
      return source && preprocess(this, material, source);
    },
    
    getPreamble: function(options) {
      return options && options.ignore_es_precision ? "" : "#ifdef GL_ES\nprecision highp float;\n#endif\n";
    },
    
    getFragmentSource: function(material) {
      var source = this.getRawSource(material, 'fragment');
      return source && preprocess(this, material, source);
    },
    
    getRawSource: function(material, which) {
      var source = this.options[which];
      if (source && (source = source.render(material))) {
        return (this.getPreamble(material) +
                this.getCommonSource(material) +
                source);
      }
      return null;
    },
    
    setRawSource: function(source, which) { this.options[which] = source && new EJS({text:source}); },
    
    setVertexSource: function(source) { this.setRawSource(source, 'vertex'); },
    
    setFragmentSource: function(source) { this.setRawSource(source, 'fragment'); },
    
    getInputMap: function(options) {
      var map = {};
      var prefix = "";
      
      if (options && options.local_prefix)  prefix = options.local_prefix+"_";
      else if (options && options.export_prefix) prefix = options.export_prefix+"_";
      
      var source = this.getRawSource(options, 'vertex') + "\n\n" + this.getRawSource(options, 'fragment');
    
      // if it's not a "shared" uniform, mangle its name.
      var rx = new RegExp("(^|\\n)((shared\\s+)?)(uniform|attribute) (\\w+) ((?!"+prefix+")[^;]*);"), result;
      while (result = rx.exec(source)) {
        var shared = /shared/.test(result[2]);
        var names = result[6].split(/,/);
        for (var i = 0; i < names.length; i++) {
          names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
          if (shared) map[names[i]] = names[i];
          else map[names[i]] = prefix+names[i];
          source = source.replace(new RegExp("(^|[^a-zA-Z0-9_])"+names[i]+"([^a-zA-Z0-9_]|$)", "g"),
                                  "$1"+prefix+names[i]+"$2");
        }
      }
      
      return map;
    },
    
    getExportDefinitions: function(exportPrefix) {
      var exports = "";
      if (this.options.exports) {
        for (var name in this.options.exports) {
          exports += this.options.exports[name]+" "+getExportedVariableName(exportPrefix, name)+";\n";
        }
      }
      return exports + "\n";
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
//        } else {
//          console.warn("skipping assignment of attribute %s (variables: %s)", name, JSON.stringify(variables));
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
      
      return program;
    },
    
    render: function(context, mesh, material, options) {
      var program = this.link(context, material);
      
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