/**
 * class Jax.Shader.Manifest
 *   
 * Used to track variable assignments. After all assignments have been made just prior to committing a render phase,
 * the manifest will be used to actually pass variable values into the shader. This keeps from specifying shader
 * values more than once. Manifest can also be used to cache values between render passes, because its values are
 * never reset.
 **/
Jax.Shader.Manifest = Jax.Class.create({
  initialize: function(existing) {
    this.values = {};
    this.texture_tracker = 0;
    this.variable_prefix = "";
    this.existing = existing || [];
  },
  
  set: function(name, value) {
    var i;
    if (value === undefined)
      if (typeof(name) == "object")
        for (i in name)
          this.set(i, name[i]);
      else throw new Error("Invalid argument (or the value given is undefined): "+
              JSON.stringify(name)+"\n\n"+new Error().stack);
    else
      for (i = 0; i < arguments.length; i += 2) {
        if (this.existing.indexOf(arguments[i]) != -1)
          this.values[arguments[i]] = arguments[i+1];
        else
          this.values[this.variable_prefix+arguments[i]] = arguments[i+1];
      }
  },
  
  getValue: function(name) {
    if (this.existing.indexOf(name) != -1)
      return this.values[name];
    else return this.values[this.variable_prefix+name];
  },
  
  texture: function(name, tex, context) {
    if (!context) throw new Error("Can't bind texture without a context");
    if (this.texture_tracker == GL_MAX_ACTIVE_TEXTURES-1) {
      /* FIXME add a callback for Materials to enter compatibility mode and recompile their shaders
         before throwing a hard error. Until this is implemented, the hard error itself is disabled
         because it causes unnecessary barfing on machines that are otherwise capable of running the
         scene. Using too many textures doesn't seem to have any catastrophic results on tested
         hardware, except some visual anomolies, so there's no reason to crash out catastrophically.
      */
//      throw new Error("Maximum number of textures ("+GL_MAX_ACTIVE_TEXTURES+") has been reached!");
    }
    
    if (typeof(this.getValue(name)) != "number")
      this.set(name, this.texture_tracker++);
    
    if (tex && tex.loaded) {
      context.glActiveTexture(GL_TEXTURES[this.getValue(name)]);
      tex.bind(context, this.getValue(name));
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
