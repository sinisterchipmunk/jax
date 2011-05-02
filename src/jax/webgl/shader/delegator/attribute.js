//= require "../delegator"

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
