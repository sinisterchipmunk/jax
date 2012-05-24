//= require "../delegator"

Jax.Shader.UniformDelegator = (function() {
  return Jax.Class.create(Jax.Shader.Delegator, {
    initialize: function($super, context, program) {
      var numUniforms = context.gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
      var uniforms = {};
      for (var i = 0; i < numUniforms; i++)
      {
        var unif = context.gl.getActiveUniform(program, i);
        uniforms[unif.name] = {
          length:unif.length,
          size:unif.size,
          type:unif.type,
          type_str:Jax.Util.enumName(unif.type),
          location: context.gl.getUniformLocation(program, unif.name)
        };
      }
      $super(context, program, uniforms);
    },
    
    set: function(name, value) {
      var self = this;
      var variables = this.variables, v, c = this.context, i;
      
      function _set(name, value) {
        if (value == undefined) throw new Error("Value is undefined for shader uniform "+JSON.stringify(name));
        
        if (v = variables[name]) {
          try {
            switch(v.type) {
              case GL_FLOAT:
                value.length != undefined ? c.gl.uniform1fv(v.location, value) : c.gl.uniform1f(v.location, value);
                break;
              case GL_BOOL: // same as int
              case GL_INT:
                value.length != undefined ? c.gl.uniform1iv(v.location, value) : c.gl.uniform1i(v.location, value);
                break;
              case GL_FLOAT_VEC2:   c.gl.uniform2fv(v.location, value); break;
              case GL_FLOAT_VEC3:   c.gl.uniform3fv(v.location, value); break;
              case GL_FLOAT_VEC4:   c.gl.uniform4fv(v.location, value); break;
              case GL_FLOAT_MAT2:   c.gl.uniformMatrix2fv(v.location, false, value); break;
              case GL_FLOAT_MAT3:   c.gl.uniformMatrix3fv(v.location, false, value); break;
              case GL_FLOAT_MAT4:   c.gl.uniformMatrix4fv(v.location, false, value); break;
              case GL_BOOL_VEC2:    // same as int
              case GL_INT_VEC2:     c.gl.uniform2iv(v.location, value); break;
              case GL_BOOL_VEC3:    // same as int
              case GL_INT_VEC3:     c.gl.uniform3iv(v.location, value); break;
              case GL_BOOL_VEC4:    // same as int
              case GL_INT_VEC4:     c.gl.uniform4iv(v.location, value); break;
              case GL_SAMPLER_2D:   c.gl.uniform1i(v.location, value); break;
              case GL_SAMPLER_CUBE: c.gl.uniform1i(v.location, value); break;
              default:
                throw new Error("Unexpected attribute type: "+v.type+" ("+JSON.stringify(v)+")");
            }
          } catch(e) {
            var error = new Error("Failed to set uniform for "+name+' ('+value+") in shader program:\n\n"+e);
            Jax.reraise(e, error);
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
