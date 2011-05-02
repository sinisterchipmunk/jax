/**
 class Jax.Shader.Manifest
   
 Used to track variable assignments. After all assignments have been made just prior to committing a render phase,
 the manifest will be used to actually pass variable values into the shader. This keeps from specifying shader
 values more than once. Manifest can also be used to cache values between render passes, because its values are
 never reset.
 **/
Jax.Shader.Manifest = Jax.Class.create({
  initialize: function() { this.values = {}; },
  set: function(name, value) {
    var i;
    if (value === undefined)
      if (typeof(name) == "object")
        for (i in name)
          this.set(i, name[i]);
      else throw new Error("Invalid argument (or the value given is undefined): "+JSON.stringify(name)+"\n\n"+new Error().stack);
    else
      for (i = 0; i < arguments.length; i += 2) {
//        if (typeof(arguments[i]) == "number")
//          throw new Error("Didn't expect a number: "+arguments[i]+" with "+JSON.stringify(arguments[i+1]));
        this.values[arguments[i]] = arguments[i+1];
      }
  },
    
  apply: function(uniforms, attributes) {
    attributes.disableAll();
    for (var name in this.values) {
      if (uniforms.doesExist(name))
        uniforms.set(name, this.values[name]);
      else if (attributes.doesExist(name))
        attributes.set(name, this.values[name]);
    }
  }
});
