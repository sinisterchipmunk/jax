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
    shader.source = source;
    context.glCompileShader(shader);
    if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
      throw new Error(buildStackTrace(context, shader, source));
  }
  
  function sanitizeName(name) {
    return name.replace(/-/, '_');
  }
  
  function getExportedVariableName(exportPrefix, name) {
    return sanitizeName("_"+exportPrefix+"_"+name);
  }
  
  /*
    preprocess shader source code to replace "import(varname, expression)" with the globalized varname if it's been
    exported (as an attribute of material.exports || self.options.exports), or expression if it hasn't.
   */
  function applyImports(self, options, source) {
    var rx = /import\((.*?),\s*(.*?)\)/, result;
    var exp;
    while (result = rx.exec(source)) {
      var name = result[1];
      if (options && (exp = (options.exports && options.exports[name]) || (self.options.exports && self.options.exports[name]))) {
        var exportedVariableName = getExportedVariableName(options.export_prefix || self.getName(), name);
        source = source.replace(result[0], result[2].replace(new RegExp(name, "g"), exportedVariableName));
      }
      else source = source.replace(result[0], "");
    }
    return source;
  }
  
  function applyExports(self, options, source) {
    var rx = /export\((.*?),\s*(.*?)(,\s*(.*?))?\)/, result;
    // rx should match both 'export(vec4, ambient)' and 'export(vec4, ambient, ambient)'
    var replacement, name, type, assignment;
    while (result = rx.exec(source)) {
      type = result[1];
      name = result[2];
      assignment = result[4] || null;
      replacement = getExportedVariableName(options && options.export_prefix || self.getName(), name)+" = ";
      if (assignment) replacement += assignment;
      else replacement += name;
      source = source.replace(result[0], replacement);
    }
    return source;
  }
  
  function mangleUniformsAndAttributes(self, material, source) {
    var map = self.getInputMap(material);
    for (var name in map)
      source = source.replace(new RegExp("(^|[^a-zA-Z0-9])"+name+"([^a-zA-Z0-9]|$)", "g"), "$1"+map[name].full_name+"$2");
    
    // remove the "shared" directive
    return source.replace(/(^|[^\w])shared\s+/g, "$1");
  }
  
  function stripSharedDefinitions(self, options, source) {
    var map = self.getInputMap(options);
    for (var i in map) {
      if (map[i].shared) {
        if (options.skip_global_definitions && options.skip_global_definitions.indexOf(map[i].full_name) != -1) {
          var rx = new RegExp("(shared\\s+)?"+map[i].scope+"\\s*"+map[i].type+"[^;]*?"+map[i].full_name+"[^;]*?;\n?", "g");
          source = source.replace(rx, "");
        }
//        else source = source.replace(rx, map[i].scope+" "+map[i].type+" "+map[i].full_name+";\n");
      }
    }
    return source.replace(/shared\s+/, '');
  }
  
  /* TODO separate preprocessing from shader and friends; perhaps a Jax.Shader.Preprocessor class? */
  function preprocess(self, options, source, isVertex) {
    source = stripSharedDefinitions(self, options, source);
//    source = source.replace(/^\s*(shared\s+|)(uniform|attribute|varying)([^;]*)?;\n?/, '');
//    if (!options || !options.skip_global_definitions)
//      source = self.getGlobalDefinitions(options, isVertex) + source;
    source = applyExports(self, options, source);
    source = applyImports(self, options, source);
    source = mangleUniformsAndAttributes(self, options, source);
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
      return source && preprocess(this, material, source, true);
    },
    
    getPreamble: function(options) {
      return options && options.ignore_es_precision ? "" : "#ifdef GL_ES\nprecision highp float;\n#endif\n";
    },
    
    getFragmentSource: function(material) {
      var source = this.getRawSource(material, 'fragment');
      return source && preprocess(this, material, source, false);
    },
    
    getRawSource: function(options, which) {
      var source = this.options[which];
      if (source && (source = source.render(options))) {
        var result = this.getPreamble(options);
        if (!options || !options.skip_export_definitions)
          result += this.getExportDefinitions(options && options.export_prefix || this.getName());
        if (!options || !options.skip_common_source)
          result += this.getCommonSource(options) + "\n";
        result += source;
        return result;
      }
      return null;
    },
    
    getGlobalDefinitions: function(options, isVertex) {
      var map = this.getInputMap(options);
      var source = "";
      for (var i in map) {
        if (map[i].scope == "attribute" && !isVertex) continue;
        source += map[i].scope+" "+map[i].type+" "+map[i].full_name+";\n";
      }
      return source;
    },
    
    setRawSource: function(source, which) { this.options[which] = source && new EJS({text:source}); },
    
    setVertexSource: function(source) { this.setRawSource(source, 'vertex'); },
    
    setFragmentSource: function(source) { this.setRawSource(source, 'fragment'); },
    
    getInputMap: function(options) {
      var map = {};
      var prefix = "";
      
      if (options && options.local_prefix)  prefix = options.local_prefix+"_";
      else if (options && options.export_prefix) prefix = options.export_prefix+"_";
      
      var source = (this.getRawSource(options, 'common')   || "") + "\n\n" +
                   (this.getRawSource(options, 'vertex')   || "")  + "\n\n" +
                   (this.getRawSource(options, 'fragment') || "");
      
      // if it's not a "shared" uniform, mangle its name.
      var rx = new RegExp("(^|\\n)((shared\\s+)?)(uniform|attribute|varying) (\\w+) ((?!"+prefix+")[^;]*);"), result;
      while (result = rx.exec(source)) {
        var shared = /shared/.test(result[2]);
        var scope = result[4];
        var type = result[5];
        var names = result[6].split(/,/);

        for (var i = 0; i < names.length; i++) {
          names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
          if (shared) map[names[i]] = names[i];
          else map[names[i]] = sanitizeName(prefix+names[i]);
          map[names[i]] = { full_name: map[names[i]], type: type, scope: scope, shared: shared };
          source = source.replace(new RegExp("(^|[^a-zA-Z0-9_])"+names[i]+"([^a-zA-Z0-9_]|$)", "g"),
                                  "$1"+prefix+names[i]+"$2");
        }
      }
      
      return map;
    },
    
    getExportDefinitions: function(exportPrefix, skip) {
      var exports = "";
      if (this.options.exports) {
        for (var name in this.options.exports) {
          if (!skip || skip.indexOf(name) == -1)
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

//= require "shader/program"
