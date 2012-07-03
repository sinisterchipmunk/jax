merge = (dest, src) ->
  for k, v of src
    dest[k] = v
    
class Jax.Shader.CompileError extends Jax.Error
  constructor: (message) ->
    super()
    @message = message

class Jax.Shader.Program
  buildBacktrace: (gl, shader, source) ->
    log = gl.getShaderInfoLog(shader)?.split(/\n/) || []
    rx = /\d+:(\d+):(.*)/
    errors = (rx.exec line for line in log)
    for index in [0...source.length]
      line = source[index]
      humanLineNo = index+1
      if humanLineNo < 10 then humanLineNo = "  #{humanLineNo}"
      else if humanLineNo < 100 then humanLineNo = " #{humanLineNo}"
      log.push "#{humanLineNo} : #{line}"
      for errno in [0...errors.length]
        if errors[errno] and parseInt(errors[errno][1]) == index+1
          log.push "   :: ERROR : #{errors[errno][2]}"
          errors.splice errno-1, 1
          errno = 0
    log
    
  getInfo: (gl, shaderType) ->
    # TODO it'd be really cool if this tracked the number of each
    # that are actually in use, and then made available the difference, so
    # that a shader could alter its source code depending on the number
    # of uniforms/varyings/etc available to be used.
    shaderType: shaderType
    maxVertexAttribs: gl.getParameter GL_MAX_VERTEX_ATTRIBS
    maxVertexUniformVectors: gl.getParameter GL_MAX_VERTEX_UNIFORM_VECTORS
    maxVaryingVectors: gl.getParameter GL_MAX_VARYING_VECTORS
    maxCombinedTextureImageUnits: gl.getParameter GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS
    maxVertexTextureImageUnits: gl.getParameter GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS
    maxFragmentTextureImageUnits: gl.getParameter GL_MAX_TEXTURE_IMAGE_UNITS
    maxFragmentUniformVectors: gl.getParameter GL_MAX_FRAGMENT_UNIFORM_VECTORS
    shadingLanguageVersion: gl.getParameter GL_SHADING_LANGUAGE_VERSION
    gl: gl

  compileShader: (gl, jaxShader, glShader, type) ->
    source = new EJS(text: jaxShader.toString()).render @getInfo gl, type
    gl.shaderSource glShader, source
    gl.compileShader glShader
    unless gl.getShaderParameter glShader, GL_COMPILE_STATUS
      backtrace = @buildBacktrace gl, glShader, source.split(/\n/)
      throw new Jax.Shader.CompileError "Shader #{jaxShader.name} failed to compile\n\n#{backtrace.join("\n")}"
      
  ensureDefaultWriters: (vertex, fragment) ->
    if vertex.main.length == 0
      vertex.main.push "gl_Position = vec4(1.0, 1.0, 1.0, 1.0);"
    if fragment.main.length == 0
      fragment.main.push "gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);"
      
  constructor: (@name = "generic") ->
    @_guid or= Jax.guid()
    @_discovered = {}
    @_isCompiled = {}
    @_glShaders = {}
    @_variables = {}
    @shaders = []
    @vertex = new Jax.Shader "#{@name}-v"
    @vertex.addEventListener 'changed', => @invalidate()
    @fragment = new Jax.Shader "#{@name}-f"
    @fragment.addEventListener 'changed', => @invalidate()
    @ensureDefaultWriters @vertex, @fragment
    
  loadDescriptor: (context) ->
    descriptors = context._shaderDescriptors or= {}
    # Went to GUIDs because hashes were too slow with big programs (example: noise).
    # Keeping the basic structure here because browsers might get faster, also,
    # Web Workers might work for speeding up shader prep work.
    # See also spec/javascripts/jax/shader/program_spec.js and the disabled tests there.
    vhash = @vertex.id
    fhash = @fragment.id
    phash = @_guid
    # vhash = Jax.Util.hash @vertex.toString()
    # fhash = Jax.Util.hash @fragment.toString()
    # phash = Jax.Util.hash(@vertex.toString() + @fragment.toString())
    descriptor = {}
    descriptor.vertex   = descriptors[vhash]
    descriptor.fragment = descriptors[fhash]
    descriptor.program  = descriptors[phash]
    descriptor
    
  saveDescriptor: (context, descriptor) ->
    descriptors = context._shaderDescriptors or= {}
    vhash = @vertex.id
    fhash = @fragment.id
    phash = @_guid
    # vhash = Jax.Util.hash @vertex.toString()
    # fhash = Jax.Util.hash @fragment.toString()
    # phash = Jax.Util.hash(@vertex.toString() + @fragment.toString())
    descriptors[vhash] = descriptor.vertex
    descriptors[fhash] = descriptor.fragment
    descriptors[phash] = descriptor.program
    descriptor
    
  glShader: (context, type) ->
    unless _gl = @_glShaders[context.id]
      gl = context.gl
      _gl = @_glShaders[context.id] = {}
    if type then _gl[type]
    else _gl
    
  compile: (context) ->
    gl = context.gl
    descriptor = @loadDescriptor context
    glShader = @glShader context
    if descriptor.program
      glShader.program = descriptor.program
      glShader.vertex = descriptor.vertex
      glShader.fragment = descriptor.fragment
    else
      # guid's on shader objects make them easier to debug,
      # this should have no effect on runtime
      descriptor.program = glShader.program = gl.createProgram()
      descriptor.program._guid = Jax.guid()
      if descriptor.vertex
        glShader.vertex = descriptor.vertex
      else
        descriptor.vertex = glShader.vertex = gl.createShader GL_VERTEX_SHADER
        descriptor.vertex._guid = Jax.guid()
        @compileShader gl, @vertex, glShader.vertex, 'vertex'
      if descriptor.fragment
        glShader.fragment = descriptor.fragment
      else
        descriptor.fragment = glShader.fragment = gl.createShader GL_FRAGMENT_SHADER
        descriptor.fragment._guid = Jax.guid()
        @compileShader gl, @fragment, glShader.fragment, 'fragment'
      gl.attachShader glShader.program, glShader.vertex
      gl.attachShader glShader.program, glShader.fragment
      gl.linkProgram glShader.program
      unless gl.getProgramParameter glShader.program, GL_LINK_STATUS
        throw new Error "Could not initialize shader!\n\n"+ \
                        gl.getProgramInfoLog glShader.program
      @saveDescriptor context, descriptor
    @_variables[context.id] = {}
    @_discovered[context.id] = false
    @_isCompiled[context.id] = true
    
  isCompiled: (context) ->
    @_isCompiled[context.id]
    
  bind: (context) ->
    @compile context unless @isCompiled context
    context.gl.useProgram @glShader(context).program
    
  ###
  If called, the next time this program is bound (via `#bind`),
  it will be recompiled. This affects all contexts, such that if
  two different contexts are using this program, the program
  will be recompiled once for each context.
  
  This method is called automatically when either the program's
  associated vertex or fragment shader is changed.
  ###
  invalidate: ->
    for k, v of @_isCompiled
      @_isCompiled[k] = false
    this
  
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
  discoverUniforms: (context, name) ->
    @compile context unless @isCompiled context
    variables = @_variables[context.id] or= {}
    gl = context.gl
    program = @glShader(context).program
    max = gl.getProgramParameter program, GL_ACTIVE_UNIFORMS
    for index in [0...max]
      info = gl.getActiveUniform program, index
      location = gl.getUniformLocation program, info.name
      variables[info.name] =
        location: location
        qualifier: "uniform"
        name: info.name
        type: info.type
        size: info.size
    variables
    
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
  discoverAttributes: (context, name) ->
    @compile context unless @isCompiled context
    gl = context.gl
    program = @glShader(context).program
    variables = @_variables[context.id] or= {}
    max = gl.getProgramParameter program, GL_ACTIVE_ATTRIBUTES
    for index in [0...max]
      info = gl.getActiveAttrib program, index
      location = gl.getAttribLocation program, info.name
      variables[info.name] =
        location: location
        qualifier: "attribute"
        enabled: false
        name: info.name
        type: info.type
        size: info.size
    variables
    
  discoverVariables: (context) ->
    return if @_discovered[context.id]
    @compile context unless @isCompiled context
    @_variables[context.id] = {}
    @discoverUniforms context
    @discoverAttributes context
    @_discovered[context.id] = true
    @_variables[context.id]
    
  variables: (context) -> @discoverVariables context
  
  discovered: (context) -> @_discovered[context.id]

  setAttribute: (context, variable, value) ->
    gl = context.gl
    unless variable.enabled
      gl.enableVertexAttribArray variable.location
      variable.enabled = true
    value.bind context
    gl.vertexAttribPointer variable.location, value.itemSize, value.dataType || GL_FLOAT, false, 0, value.offset || 0
    
  setUniform: (context, variable, value) ->
    gl = context.gl
    switch variable.type
      when GL_FLOAT
        if value?.length then gl.uniform1fv variable.location, value
        else gl.uniform1f variable.location, value
      when GL_BOOL
        if value?.length then gl.uniform1iv variable.location, value
        else gl.uniform1i variable.location, value
      when GL_INT
        if value?.length then gl.uniform1iv variable.location, value
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
      else throw new Error "Unexpected uniform type: #{variable}"
  
  ###
  Sets the shader's variables according to the name/value pairs which appear
  in the given `assigns` object. An error will be raised if any named variable
  does not exist. Attribute variables will be enabled as they are encountered.
  If the program has not already been compiled and activated, an error is raised.
  ###
  set: (context, assigns) ->
    @discoverVariables context unless @discovered context.id
    variables = @_variables[context.id]
    gl = context.gl
    textureIndex = 0
    for name, value of assigns
      variable = variables[name]
      # throw new Error "No active variable named #{name}" unless variable
      if variable
        if value is undefined
          # variable.value = undefined
          if variable.qualifier is 'attribute' and variable.enabled
            gl.disableVertexAttribArray variable.location
            variable.enabled = false
          continue
      
        # special case for textures
        if value instanceof Jax.Texture
          gl.activeTexture GL_TEXTURE0 + textureIndex
          value.refresh context unless value.isValid context
          gl.bindTexture value.options.target, value.getHandle context
          value = textureIndex++
        else if value?.toVec4
          value = value.toVec4()
      
        try
          if variable.qualifier is 'attribute' then @setAttribute context, variable, value
          else @setUniform context, variable, value
        catch e
          blurb = "#{variable.qualifier} #{Jax.Util.enumName variable.type} #{variable.name}"
          throw new Error "Error occurred setting #{blurb} to `#{JSON.stringify value}`: #{e.message}"
    true

  ###
  Disables any attribute variable which was previously enabled by this shader.
  The shader is assumed to already be compiled and activated. If variables
  have not yet been discovered, an error is raised.
  ###
  disable: (context) ->
    return unless variables = @_variables[context.id]
    gl = context.gl
    for name, variable of variables
      if variable.enabled
        gl.disableVertexAttribArray variable.location
