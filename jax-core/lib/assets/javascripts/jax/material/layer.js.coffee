class Jax.Material.Layer
  shaderSource = (data, which) ->
    source = (data.common || "") + (data[which] || "")
    options =
      SHADER_TYPE: which
    new EJS(text:source).render(options)
  
  constructor: (options) ->
    @setVariables = options?.setVariables if options?.setVariables
    @assigns = new Jax.Material.ShaderVariableMap
    if options
      if options.shader and (src = Jax.shader_data options.shader) and (src.fragment || src.vertex)
        @_shaderSource = src
      else if (src = options) and (src.fragment || src.vertex)
        @_shaderSource = src
      # handle other options
      for k, v of options
        @[k] = v
        
    unless @_shaderSource
      if (src = this.__proto__.constructor.shaderSource) isnt undefined
        @_shaderSource = src
      else if (src = Jax.shader_data Jax.Util.underscore @__proto__.constructor.name) and \
              (src.fragment || src.vertex)
        @_shaderSource = src
  
  attachTo: (shader, insertionIndex) ->
    map = {}
    if @_shaderSource
      vertex = shaderSource @_shaderSource, 'vertex'
      fragment = shaderSource @_shaderSource, 'fragment'
      map = shader.insert vertex, fragment, insertionIndex
    @variableMap = map

  numPasses: (context) -> 1

  crc: ->
    if @_shaderSource
      Jax.Util.crc shaderSource(@_shaderSource, 'vertex') +
                   shaderSource(@_shaderSource, 'fragment')
    else
      Jax.Util.crc ""
  
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
