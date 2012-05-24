merge = (dest, src) ->
  for k, v of src
    dest[k] = v
    
class Jax.Shader2.CompileError extends Jax.Error
  constructor: (message) ->
    super()
    @message = message

class Jax.Shader2.Program
  buildBacktrace = (gl, shader, source) ->
    log = gl.getShaderInfoLog(shader)?.split(/\n/) || []
    rx = /\d+:(\d+):(.*)/
    errors = (rx.exec line for line in log)
    for index in [0...source.length]
      line = source[index]
      humanLineNo = index+1
      if humanLineNo < 10 then humanLineNo = "  #{humanLineNo}" else if humanLineNo < 100 then humanLineNo = " #{humanLineNo}"
      log.push "#{humanLineNo} : #{line}"
      for errno in [0...errors.length]
        if errors[errno] and parseInt(errors[errno][1]) == index+1
          log.push "   :: ERROR : #{errors[errno][2]}"
          errors.splice errno-1, 1
          errno = 0
    log

  compileShader = (gl, jaxShader, glShader) ->
    gl.shaderSource glShader, jaxShader.toString()
    gl.compileShader glShader
    unless gl.getShaderParameter glShader, GL_COMPILE_STATUS
      backtrace = buildBacktrace gl, glShader, jaxShader.toLines()
      throw new Jax.Shader2.CompileError "Shader #{jaxShader.name} failed to compile\n\n#{backtrace.join("\n")}"
    
  constructor: (@name = "generic") ->
    @_isCompiled = {}
    @_glShaders = {}
    @shaders = []
    @vertex = new Jax.Shader2 "#{@name}-v"
    @fragment = new Jax.Shader2 "#{@name}-f"
    @variables = {}
    
  glShader: (context, type) ->
    unless _gl = @_glShaders[context.id]
      gl = context.gl
      _gl = @_glShaders[context.id] =
        program: gl.createProgram()
        vertex: gl.createShader GL_VERTEX_SHADER
        fragment: gl.createShader GL_FRAGMENT_SHADER
      gl.attachShader _gl.program, _gl.vertex
      gl.attachShader _gl.program, _gl.fragment
    if type then _gl[type] else _gl
    
  compile: (context) ->
    gl = context.gl
    glShader = @glShader context
    compileShader gl, @vertex, glShader.vertex
    compileShader gl, @fragment, glShader.fragment
    gl.linkProgram glShader.program
    unless gl.getProgramParameter glShader.program, GL_LINK_STATUS
      throw new Error "Could not initialize shader!\n\n"+ gl.getProgramInfoLog glShader.program
    @variables[context.id] = {}
    @_isCompiled[context.id] = true
    
  isCompiled: (context) ->
    @_isCompiled[context.id]
    
  bind: (context) ->
    @compile context unless @isCompiled context
    context.gl.useProgram @glShader(context).program
  
  ###
  Returns all possible information about the named uniform.
  
  If the requested uniform is not found, `null` is returned.
  Otherwise, returns a new object containing the following information:
  
      name: the name of the uniform
      location: the program location of the uniform
      type: an enum (like GL_FLOAT) representing the uniform's type
      size: the size of the uniform
      qualifier: "uniform"

  ###
  discoverUniform: (context, name) ->
    @compile context unless @isCompiled context
    @discoveredUniforms or= {}
    unless @discoveredUniforms[context.id]
      @discoveredUniforms[context.id] = {}
      gl = context.gl
      program = @glShader(context).program
      max = gl.getProgramParameter program, GL_ACTIVE_UNIFORMS
      for index in [0...max]
        info = gl.getActiveUniform program, index
        location = gl.getUniformLocation program, info.name
        @discoveredUniforms[context.id][info.name] =
          location: location
          qualifier: "uniform"
          name: info.name
          type: info.type
          size: info.size
    @discoveredUniforms[context.id][name] or null

  ###
  Returns all possible information about the named attribute.
  
  If the requested attribute is not found, `null` is returned.
  Otherwise, returns a new object containing the following information:
  
      name: the name of the attribute
      type: an enum (like GL_FLOAT) representing the attribute's type
      size: the size of the variable
      location: the program location of the attribute
      qualifier: "attribute"
      enabled: whether this attribute was ever explicitly enabled by this
               instance of Jax.Program
      
  ###
  discoverAttribute: (context, name) ->
    @compile context unless @isCompiled context
    gl = context.gl
    program = @_glShaders[context.id].program
    # location = gl.getAttribLocation program, name
    # return null if location is -1

    @discoveredAttributes or= {}
    unless @discoveredAttributes[context.id]
      @discoveredAttributes[context.id] = {}
      gl = context.gl
      program = @glShader(context).program
      max = gl.getProgramParameter program, GL_ACTIVE_ATTRIBUTES
      for index in [0...max]
        info = gl.getActiveAttrib program, index
        location = gl.getAttribLocation program, info.name
        @discoveredAttributes[context.id][info.name] =
          location: location
          qualifier: "attribute"
          enabled: false
          name: info.name
          type: info.type
          size: info.size
    @discoveredAttributes[context.id][name] or null
    
  setAttribute: (gl, variable, value) ->
    unless variable.enabled
      gl.enableVertexAttribArray variable.location
      variable.enabled = true
    value.bind gl
    gl.vertexAttribPointer variable.location, value.itemSize, value.dataType || GL_FLOAT, false, 0, 0
    
  setUniform: (gl, variable, value) ->
    switch variable.type
      when GL_FLOAT
        if value.length then gl.uniform1fv variable.location, value
        else gl.uniform1f variable.location, value
      when GL_BOOL
        if value.length then gl.uniform1iv variable.location, value
        else gl.uniform1i variable.location, value
      when GL_INT
        if value.length then gl.uniform1iv variable.location, value
        else gl.uniform1i variable.location, value
      when GL_FLOAT_VEC2   then gl.uniform2fv variable.location, value
      when GL_FLOAT_VEC3   then gl.uniform3fv variable.location, value
      when GL_FLOAT_VEC4   then gl.uniform4fv variable.location, value
      when GL_BOOL_VEC2    then gl.uniform2iv variable.location, value
      when GL_INT_VEC2     then gl.uniform2iv variable.location, value
      when GL_BOOL_VEC3    then gl.uniform3iv variable.location, value
      when GL_INT_VEC3     then gl.uniform3iv variable.location, value
      when GL_BOOL_VEC4    then gl.uniform4iv variable.location, value
      when GL_INT_VEC4     then gl.uniform4iv variable.location, value
      when GL_SAMPLER_2D   then gl.uniform1i variable.location, value
      when GL_SAMPLER_CUBE then gl.uniform1i variable.location, value
      when GL_FLOAT_MAT2   then gl.uniformMatrix2fv variable.location, false, value
      when GL_FLOAT_MAT3   then gl.uniformMatrix3fv variable.location, false, value
      when GL_FLOAT_MAT4   then gl.uniformMatrix4fv variable.location, false, value
      else throw new Error "Unexpected attribute type: #{variable}"

  ###
  Sets the shader's variables according to the name/value pairs which appear
  in the given `assigns` object. An error will be raised if any named variable
  does not exist. Attribute variables will be enabled as they are encountered.
  If the program has not already been compiled and activated, an error is raised.
  ###
  set: (context, assigns) ->
    gl = context.gl
    variables = @variables[context.id]
    for name, value of assigns
      variable = variables[name] or= @discoverUniform(context, name) || @discoverAttribute(context, name)
      # throw new Error "No active variable named #{name}" unless variable
      if variable
        if variable.qualifier is 'attribute' then @setAttribute gl, variable, value
        else @setUniform gl, variable, value

  ###
  Disables any attribute variable which was previously enabled by this shader.
  The shader is assumed to already be compiled and activated. If variables
  have not yet been discovered, an error is raised.
  ###
  disable: (context) ->
    return unless variables = @variables[context.id]
    gl = context.gl
    for name, variable of variables
      if variable.enabled
        gl.disableVertexAttribArray variable.location
