class Jax.Material.Layer
  shaderSource = (data, which) ->
    source = (data.common || "") + (data[which] || "")
    options =
      SHADER_TYPE: which
    new EJS(text:source).render(options)
  
  constructor: (options, material) ->
    @setVariables = options?.setVariables if options?.setVariables
    @assigns = new Jax.Material.ShaderVariableMap
    if options
      if options.shader and (src = Jax.shader_data options.shader) and (src.fragment || src.vertex)
        @_shaderSource = src
      else if (src = this.__proto__.constructor.shaderSource) isnt undefined
        @_shaderSource = src
      else if (src = options) and (src.fragment || src.vertex)
        @_shaderSource = src
      # handle other options
      for k, v of options
        @[k] = v
    @attachTo material if material
  
  attachTo: (material) ->
    map = {}
    if @_shaderSource
      fmap = material.fragment.append shaderSource @_shaderSource, 'fragment'
      vmap = material.vertex.append   shaderSource @_shaderSource, 'vertex'
      map[k] = v for k, v of fmap
      map[k] = v for k, v of vmap
    @variableMap = map

  numPasses: (context) -> 1
  
  clearAssigns: ->
    map = @assigns
    map[k] = undefined for k of map
    true
    
  setup: (context, mesh, model, pass) ->
    varmap = null
    @clearAssigns()
    if @setVariables
      result = @setVariables(context, mesh, model, @assigns, pass)
      return false if result is false
    return @assigns
