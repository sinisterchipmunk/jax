class Jax.Material.Custom extends Jax.Material
  constructor: (options, name) ->
    preprocess = (set) ->
      for key, value of set
        if typeof value is 'string' and /^\#[0-9a-f]+$/.test value
          set[key] = Jax.Color.parse value
        else if typeof value is 'object' then preprocess value
        
    preprocess options if options
    super options, name
