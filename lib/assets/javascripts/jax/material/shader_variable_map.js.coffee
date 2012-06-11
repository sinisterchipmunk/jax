class Jax.Material.ShaderVariableMap
  constructor: (vmap, fmap, @assigns = {}) ->
    @_map = {}
    @_map[k] = v for k, v of vmap
    @_map[k] = v for k, v of fmap
    @realNames = (v for k, v of @_map)
    
  set: (keyOrVariables, valueOrNothing) ->
    [map, assigns, realNames] = [@_map, @assigns, @realNames]

    if valueOrNothing is undefined
      for k, v of keyOrVariables
        continue if v is undefined
        if key = map[k] then assigns[key] = v
        else if k in realNames then assigns[k] = v
        else throw new Error "Variable '#{k}' not found!"
    else
      k = keyOrVariables
      v = valueOrNothing
      
      if v isnt undefined
        if key = map[k] then assigns[key] = v
        else if k in realNames then assigns[k] = v
        else throw new Error "Variable '#{k}' not found!"
    assigns
  
  texture: (name, tex, context) ->
    @set name, tex
    