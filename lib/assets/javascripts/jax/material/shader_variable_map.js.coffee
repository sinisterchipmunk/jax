class Jax.Material.ShaderVariableMap
  constructor: (vmap, fmap, @assigns = {}) ->
    @_map = {}
    @_map[k] = v for k, v of vmap
    @_map[k] = v for k, v of fmap
    @realNames = (v for k, v of @_map)
    
  set: (vars) ->
    [map, assigns, realNames] = [@_map, @assigns, @realNames]

    for k, v of vars
      if key = map[k] then assigns[key] = v
      else if k in realNames then assigns[k] = v
      else throw new Error "Variable '#{k}' not found!"
    assigns
  