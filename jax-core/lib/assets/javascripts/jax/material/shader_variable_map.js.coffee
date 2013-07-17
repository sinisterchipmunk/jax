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
    unless @alreadyWarned
      @alreadyWarned = true
      console.log "`vars.set` and `vars.texture` are both deprecated. Instead, " + \
                  "you should just set variable values directly on the `vars` " + \
                  "object. For example, to set a shader variable named `color` " + \
                  "to the value [1, 1, 1, 1], use the syntax: " + \
                  "vars.color = [1, 1, 1, 1]`"
    
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

  # make sure `set` and `texture` don't get nulled out between passes
  @define 'set', enumerable: false
  @define 'texture', enumerable: false
  