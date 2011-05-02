//= require "shader"

Jax.ShaderChain = (function() {
  function sanitizeName(name) {
    return name.replace(/-/, '_');
  }
  
  function preprocessFunctions(self, prefix, suffix, source) {
    /* TODO mangle all function and structure names to prevent conflicts -- right now we only mangle main() */
    
    return source.replace(/void\s*main\s*\(/, 'void '+sanitizeName(prefix)+'_main_'+sanitizeName(suffix)+'(');
  }
  
  function preprocessorOptions(self) {
    return {
      ignore_es_precision: true,
      export_prefix: self.getName(),
      exports: self.gatherExports(),
      skip_export_definitions: true,
      skip_global_definitions: [] // array containing definitions so they aren't accidentally redefined
    };
  }
  
  function preventRedefinition(imap, options) {
    for (var j in imap)
      options.skip_global_definitions.push(imap[j].full_name);
  }
  
  return Jax.Class.create(Jax.Shader.Program, {
    initialize: function($super, name) {
      $super();
      this.name = name;
      this.shaders.push(this.getMasterShader());
      this.phases = [];
    },
    
    getMasterShader: function() {
      return this.master_shader = this.master_shader || new Jax.Shader({});
    },
    
    addShader: function(shader) {
      if (typeof(shader) == "string")
        if (Jax.shaders[shader])
          shader = Jax.shaders[shader];
        else throw new Error("Shader is not defined: "+shader);
      this.phases.push(shader);
      this.invalidate();
    },
    
    getShaderNames: function() {
      var result = [];
      for (var i = 0; i < this.phases.length; i++)
        result[i] = this.phases[i].getName();
      return result;
    },
    
    removeAllShaders: function() {
      while (this.phases.length > 0) this.phases.pop();
    },
    
    link: function($super, context, material) {
      var program = this.getGLProgram(context);
      
      if (!program.linked) {
        var master = this.getMasterShader();
        master.setVertexSource(this.getVertexSource(material));
        master.setFragmentSource(this.getFragmentSource(material));
        program = $super(context, material);
      }
      
      return program;
    },
    
    getFragmentSource: function(options) {
      options = Jax.Util.normalizeOptions(options, preprocessorOptions(this));
      
      var source = "";
      source += this.getExportDefinitions(options);

      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "\n/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'f', this.phases[i].getFragmentSource(options));
        source += "\n\n";

        preventRedefinition(this.phases[i].getInputMap(options), options);
      }
      
      return source + this.getFragmentMain(options);
    },
    
    getVertexSource: function(options) {
      options = Jax.Util.normalizeOptions(options, preprocessorOptions(this));
      
      var source = "";
      source += this.getExportDefinitions(options);

      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "\n/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'v', this.phases[i].getVertexSource(options));
        source += "\n\n";
        
        preventRedefinition(this.phases[i].getInputMap(options), options);
      }
      
      return source + this.getVertexMain(options);
    },
    
    getVertexMain: function(options) {
      var functionCalls = "";
      for (var i = 0; i < this.phases.length; i++) {
        functionCalls += "  "+sanitizeName(this.phases[i].getName())+i+"_main_v();\n";
      }
      
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               functionCalls +
             "}\n";
    },
    
    getFragmentMain: function(options) {
      var functionCalls = "";
      for (var i = 0; i < this.phases.length; i++) {
        functionCalls += "  "+sanitizeName(this.phases[i].getName())+i+"_main_f();\n";
      }
      
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               functionCalls +
             "}\n";
    },
    
    getExportDefinitions: function(options) {
      var source = "\n/** Exported shader chain variables **/\n";
      var skip = [];
      for (var i = 0; i < this.phases.length; i++) {
        source += this.phases[i].getExportDefinitions(options.export_prefix, skip);
        for (var j in this.phases[i].options.exports)
          skip.push(j);
      }
      return source;
    },
    
    getGlobalDefinitions: function(options, isVertex) {
      var source = "\n/** Shared uniforms, attributes and varyings **/\n";
      var map = this.getInputMap(options);
      for (var name in map) {
        if (map[name].scope == "attribute" && !isVertex) continue;
        source += map[name].scope+" "+map[name].type+" "+map[name].full_name+";\n";
      }
      return source;
    },
    
    getInputMap: function(options) {
      var map = {};
      for (var i = 0; i < this.phases.length; i++) {
        var _map = this.phases[i].getInputMap(options);
        for (var name in _map) {
          if (map[_map[name]]) {
            if (map[name].type      != _map[name].type)      throw new Error("Conflicting types for variable '"+name+"' ("+map[name].type+" and "+_map[name].type+")!");
            if (map[name].scope     != _map[name].scope)     throw new Error("Conflicting scopes for variable '"+name+"' ("+map[name].scope+" and "+_map[name].scope+")!");
          }
          else map[_map[name].full_name] = _map[name];
        }
      }
      return map;
    },
    
    gatherExports: function() {
      var result = {};
      for (var i = 0; i < this.phases.length; i++) {
        if (this.phases[i].options.exports) {
          Jax.Util.merge(this.phases[i].options.exports, result);
        }
      }
      return result;
    },
    
    getName: function() { return this.name; }
  });
})();