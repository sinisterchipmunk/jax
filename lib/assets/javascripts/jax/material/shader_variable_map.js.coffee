###
A dummy object that is only here for legacy reasons;
it could really be replaced by a generic object except
for the `set` function and the `texture` function, both
of which are deprecated in favor of just directly setting
property values on the object.

Values assigned to the variable map are eventually assigned
to shaders, so their keys should be names of shader
variables.
###
class Jax.Material.ShaderVariableMap
  set: (keyOrVariables, valueOrNothing) ->
    if valueOrNothing is undefined
      for k, v of keyOrVariables
        continue if v is undefined
        this[k] = v
    else
      k = keyOrVariables
      v = valueOrNothing
      if v isnt undefined
        this[k] = v
  
  texture: (name, tex, context) ->
    @set name, tex
    