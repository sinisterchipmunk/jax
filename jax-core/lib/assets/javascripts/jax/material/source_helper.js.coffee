class Jax.Material.SourceHelper
  constructor: (descriptor) ->
    @_required = { vertex: {}, fragment: {} }
    $.extend this, descriptor

  require: (path) ->
    throw new Error "(BUG) no shaderType!" unless @shaderType
    if Jax.shaderTemplates?[path]
      if @_required[@shaderType][path]
        "// already required #{path}\n"
      else
        @_required[@shaderType][path] = true
        Jax.shaderTemplates[path] this
    else
      throw new Error "Shader source template #{path} does not exist"
