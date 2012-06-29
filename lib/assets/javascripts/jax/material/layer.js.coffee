class Jax.Material.Layer
  shaderSource = (data, which) ->
    source = (data.common || "") + (data[which] || "")
    options =
      SHADER_TYPE: which
    new EJS({text:source}).render(options)
  
  constructor: (options, material) ->
    throw new Error "Second argument must be an instance of Jax.Material" unless material
    @setVariables = options?.setVariables if options?.setVariables
    if options?.shader and (data = Jax.shader_data options.shader)?.fragment || data?.vertex
      fmap = material.fragment.append shaderSource data, 'fragment'
      vmap = material.vertex.append   shaderSource data, 'vertex'
    else if (data = this.__proto__.constructor.shaderSource) isnt undefined
      fmap = material.fragment.append shaderSource data, 'fragment'
      vmap = material.vertex.append   shaderSource data, 'vertex'
    else if (data = options) and data?.fragment || data?.vertex
      fmap = material.fragment.append shaderSource data, 'fragment'
      vmap = material.vertex.append   shaderSource data, 'vertex'
    else
      fmap = vmap = {}
    @material = material
    @variableMap = new Jax.Material.ShaderVariableMap fmap, vmap, material?.assigns
    @transitionalVariableMap = {}
    
  numPasses: (context) -> 1
  
  clearTransitionalVariableMap: ->
    map = @transitionalVariableMap
    map[k] = undefined for k of map
    true
    
  setup: (context, mesh, model, pass) ->
    varmap = null
    @clearTransitionalVariableMap()
    if @setVariables
      vars = @transitionalVariableMap
      return false if @setVariables(context, mesh, model, vars, pass) is false
      @variableMap.set vars
    true
  