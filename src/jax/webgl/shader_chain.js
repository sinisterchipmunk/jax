//= require "shader"

Jax.ShaderChain = (function() {
  function preprocessFunctions(self, prefix, suffix, source) {
    /* TODO mangle all function and structure names to prevent conflicts -- right now we only mangle main() */
    
    return source.replace(/void\s*main\s*\(/, 'void '+prefix+'_main_'+suffix+'(');
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
      if (typeof(shader) == "string") shader = Jax.shaders[shader];
      this.phases.push(shader);
      this.invalidate();
    },
    
    link: function($super, context, material) {
      var master = this.getMasterShader();
      master.setVertexSource(this.getVertexSource(material));
      master.setFragmentSource(this.getFragmentSource(material));
      $super(context, material);
    },
    
    getFragmentSource: function(options) {
      options = Jax.Util.normalizeOptions({
        ignore_es_precision: true,
        export_prefix: this.getName(),
        exports: this.gatherExports()
      });
      
      var source = "";
      source += this.getExportDefinitions(options);
      
      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'f', this.phases[i].getFragmentSource(options));
        source += "\n\n";
      }
      
      return source + this.getFragmentMain(options);
    },
    
    getVertexSource: function(options) {
      options = Jax.Util.normalizeOptions({
        ignore_es_precision: true,
        export_prefix: this.getName(),
        exports: this.gatherExports()
      });
      
      var source = "";
      source += this.getExportDefinitions(options);
      
      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'v', this.phases[i].getVertexSource(options));
        source += "\n\n";
      }
      
      return source + this.getVertexMain(options);
    },
    
    getVertexMain: function(options) {
      var functionCalls = "";
      for (var i = 0; i < this.phases.length; i++) {
        functionCalls += "  "+this.phases[i].getName()+i+"_main_v();\n";
      }
      
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               functionCalls +
             "}\n";
    },
    
    getFragmentMain: function(options) {
      var functionCalls = "";
      for (var i = 0; i < this.phases.length; i++) {
        functionCalls += "  "+this.phases[i].getName()+i+"_main_f();\n";
      }
      
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               functionCalls +
             "}\n";
    },
    
    getExportDefinitions: function(options) {
      var source = "\n/** Exported shader chain variables **/\n";
      for (var i = 0; i < this.phases.length; i++) {
        source += this.phases[i].getExportDefinitions(options.export_prefix);
      }
      return source;
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