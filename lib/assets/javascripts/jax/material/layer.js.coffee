class Jax.Material.Layer
  shaderSource = (data, which) ->
    source = (data.common || "") + (data[which] + "")
    options =
      SHADER_TYPE: which
    new EJS({text:source}).render(options)
  
  constructor: (options, material) ->
    if options?.shader and (data = Jax.shader_data options.shader)?.fragment || data?.vertex
      fmap = material.fragment.append shaderSource data, 'fragment' if data.fragment
      vmap = material.vertex.append   shaderSource data, 'vertex'   if data.vertex
    else if (data = this.__proto__.constructor.shaderSource) isnt undefined
      fmap = material.fragment.append shaderSource data, 'fragment' if data.fragment
      vmap = material.vertex.append   shaderSource data, 'vertex'   if data.vertex
    else
      fmap = vmap = {}
    @variableMap = new Jax.Material.ShaderVariableMap fmap, vmap, material?.assigns
    
  numPasses: (context) -> 1
    
  setup: (context, mesh, model, pass) ->
    varmap = null
    @setVariables context, mesh, model, @variableMap, pass if @setVariables
