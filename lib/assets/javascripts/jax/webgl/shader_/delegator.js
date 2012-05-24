Jax.Shader.Delegator = (function() {
  return Jax.Class.create({
    initialize: function(context, program, variables) {
      this.context = context;
      this.program = program;
      this.variables = variables;
    },
    
    doesExist: function(key) {
      return this.variables[key] != undefined;
    }
  });
})();
