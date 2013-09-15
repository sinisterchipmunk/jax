class Jax.Material.Layer
  class Jax.Material.SourceHelper
    constructor: (descriptor) ->
      $.extend this, descriptor

    require: (path) ->
      if Jax.shaderTemplates?[path]
        Jax.shaderTemplates[path] this
      else
        throw new Error "Shader source template #{path} does not exist"

  getShaderSource: (sourceHelper, type = null) ->
    if type
      sourceHelper.shaderType = type
      (@shaders.common?(sourceHelper) || "") +
      (@shaders[type]?(sourceHelper)  || "")
    else
      if @shaders
        vertex   = @getShaderSource sourceHelper, 'vertex'
        fragment = @getShaderSource sourceHelper, 'fragment'
        vertex  : vertex
        fragment: fragment
      else
        vertex  : ""
        fragment: ""

  constructor: (options) ->
    @setVariables = options?.setVariables if options?.setVariables
    @assigns = new Jax.Material.ShaderVariableMap

  numPasses: (context) -> 1

  ###
  Calculates and returns a CRC value for the shader source code. The CRC value
  is not guaranteed to match the exact shader source that will be sent to the
  renderer, but it _is_ guaranteed to be unique to this material layer
  (assuming no other material layer uses exactly the same shader).
  ###
  crc: ->
    descriptor = Jax.Shader.Program.getGenericDescriptor()
    helper = new Jax.Material.SourceHelper descriptor
    source = @getShaderSource helper
    Jax.Util.crc source.vertex + source.fragment
  
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
