class Jax.Shader.CompileError extends Jax.Error
  constructor: (message) ->
    super()
    @message = message

class Jax.Shader.Program
  popularity = {}
  @resetPopularities: -> popularity = {}
  @getPopularities: -> popularity

  shallowClone = (obj) ->
    clone = {}
    clone[k] = v for k, v of obj
    clone

  constructor: (@name = "generic") ->
    @_contexts = {}
    @_guid = Jax.guid()

    # array of attributes who passed popularity, but then were disabled at
    # any point during rendering and thus are not ideal candidates for index 
    # 0
    @_dislikedAttributes = []

    @variables =
      attributes: {}
      uniforms:   {}
      varyings:   {}
    @vertex = new Jax.Shader "#{@name}-v"
    @vertex.on 'changed', @vertexShaderChanged
    @fragment = new Jax.Shader "#{@name}-f"
    @fragment.on 'changed', @fragmentShaderChanged
    if @vertex.main.length == 0
      @vertex.main.push "gl_Position = vec4(1.0, 1.0, 1.0, 1.0);"
    if @fragment.main.length == 0
      @fragment.main.push "gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);"

  ###
  Sets the shader's variables according to the name/value pairs which appear
  in the given `assigns` object. An error will be raised if any named 
  variable does not exist. If the program has not already been compiled and 
  activated, an error is raised.
  ###
  set: (context, assigns) ->
    {gl} = context
    mustRebind = false
    for name, attribute of @variables.attributes
      if (value = assigns[name]) isnt undefined
        @setAttribute context, attribute, value
      else
        # console.log 'not using', name
        id = context.id
        if @isAttributeEnabled context, attribute.location[id]
          if attribute.location[id] is 0 and @_dislikedAttributes.indexOf(name) is -1
            # console.log 'disliking', name
            # make a note that this attribute was disabled; finish iterating
            # in case other attributes follow suit; then rebind and retry
            @_dislikedAttributes.push name
            mustRebind = true
          # console.log 'disabling', name
          @disableAttribute context, attribute.location[id], attribute.name
      attribute.value = value
    if mustRebind
      descriptor = @getDescriptor context
      @popularize()
      @relink descriptor
      @bind context
      return @set context, assigns
    @__textureIndex = 0
    for name, uniform of @variables.uniforms
      value = assigns[name]
      continue if value is undefined
      value = value.toVec4() if value?.toVec4
      @setUniform context, uniform, value
      uniform.value = value
    true

  setAttribute: (context, variable, value) ->
    id = context.id
    unless @isAttributeEnabled context, variable.location[id]
      @enableAttribute context, variable.location[id], variable.name
    value.bind context
    context.gl.vertexAttribPointer variable.location[id], value.itemSize, value.dataType || GL_FLOAT, false, 0, value.offset || 0

  setUniform: (context, variable, value) ->
    {gl} = context
    id = context.id
    switch variable.type
      when 'float'          then gl.uniform1f  variable.location[id], value
      when 'bool', 'int'    then gl.uniform1i  variable.location[id], value
      when 'vec2'           then gl.uniform2fv variable.location[id], value
      when 'vec3'           then gl.uniform3fv variable.location[id], value
      when 'vec4'           then gl.uniform4fv variable.location[id], value
      when 'bvec2', 'ivec2' then gl.uniform2iv variable.location[id], value
      when 'bvec3', 'ivec3' then gl.uniform3iv variable.location[id], value
      when 'bvec4', 'ivec4' then gl.uniform4iv variable.location[id], value
      when 'mat2' then gl.uniformMatrix2fv variable.location[id], false, value
      when 'mat3' then gl.uniformMatrix3fv variable.location[id], false, value
      when 'mat4' then gl.uniformMatrix4fv variable.location[id], false, value
      when 'sampler2D', 'samplerCube'
        if !(value instanceof Jax.Texture) or value.ready()
          gl.activeTexture GL_TEXTURE0 + @__textureIndex
          value.refresh context unless value.isValid context
          gl.bindTexture value.options.target, value.getHandle context
          gl.uniform1i variable.location[id], value = @__textureIndex++
      else throw new Error "Unexpected variable type: #{variable.type}"

  insert: (vsrc, fsrc, index) ->
    mangler = Jax.guid()
    map = {}
    vmap = @vertex.insert   vsrc, mangler, index
    fmap = @fragment.insert fsrc, mangler, index
    map[k] = v for k, v of fmap
    map[k] = v for k, v of vmap
    map

  bindAttributeLocations: (descriptor) ->
    {gl} = descriptor.context
    # sort variables used by this shader, in descending order of popularity
    # and secondarily alphabetically, so that they have a very predictable
    # order of appearance. This will help reduce attribute switching.
    #
    # Any attributes which have been explicitly disliked, will be filtered
    # downward. This doesn't mean they can't be chosen, but that attributes
    # which have never been disabled have the best chance of selection for
    # slot 0.
    variables = (variable for name, variable of @variables.attributes)
    variables.sort (a, b) =>
      if (da = @_dislikedAttributes.indexOf(a.name)) isnt (db = @_dislikedAttributes.indexOf(b.name))
        if da is -1 then return -1
        else return 1
      if (barr = popularity[b.name]) and (aarr = popularity[a.name])
        if (s = barr.length - aarr.length) != 0
          return s
      a.name.toLowerCase().localeCompare b.name.toLowerCase()
    nextAvailableLocation = 0
    id = descriptor.context.id
    for variable in variables
      variable.location or= {}
      variable.location[id] = nextAvailableLocation
      gl.bindAttribLocation descriptor.glProgram, nextAvailableLocation, variable.name
      nextAvailableLocation += switch variable.type
        when 'mat2' then 2
        when 'mat3' then 3
        when 'mat4' then 4
        else 1
    true

  enableAllAttributes: (descriptor) ->
    id = descriptor.context.id
    for name, variable of @variables.attributes
      @enableAttribute descriptor.context, variable.location[id], name
    true

  enableAttribute: (context, location, name) ->
    context._enabledAttributes[location] = 1
    context.gl.enableVertexAttribArray location

  disableAttribute: (context, location, name) ->
    context._enabledAttributes[location] = 0
    context.gl.disableVertexAttribArray location

  isAttributeEnabled: (context, location) ->
    context._enabledAttributes[location] is 1

  getUniformLocations: (descriptor) ->
    {gl} = descriptor.context
    program = @getGLProgram descriptor.context
    id = descriptor.context.id
    for name, variable of @variables.uniforms
      variable.location or= {}
      variable.location[id] = gl.getUniformLocation program, variable.name
      if variable.location[id] is null
        # remove variables that were not used in the shader, to prevent
        # uselessly iterating through them later
        delete @variables.uniforms[name]
    true

  relink: (descriptor) ->
    {gl} = descriptor.context
    # console.log 'relink'
    @bindAttributeLocations descriptor
    gl.linkProgram  descriptor.glProgram
    @enableAllAttributes descriptor
    @getUniformLocations descriptor

  compileShader: (descriptor, type, jaxShader, glShader) ->
    {gl} = descriptor.context
    info = @getShaderContext descriptor, type
    source = new EJS(text: jaxShader.toString()).render info
    gl.shaderSource glShader, source
    gl.compileShader glShader
    unless gl.getShaderParameter glShader, GL_COMPILE_STATUS
      backtrace = @buildBacktrace gl, glShader, source.split(/\n/)
      throw new Jax.Shader.CompileError "Shader #{jaxShader.name} failed to compile\n\n#{backtrace.join("\n")}"
    glShader

  compileShaders: (descriptor) ->
    {context, glVertex, glFragment} = descriptor
    {gl} = context
    @compileShader descriptor, 'vertex',   @vertex,   glVertex
    @compileShader descriptor, 'fragment', @fragment, glFragment
    gl.attachShader descriptor.glProgram, descriptor.glVertex
    gl.attachShader descriptor.glProgram, descriptor.glFragment

  compileProgram: (descriptor) ->
    gl = descriptor.context.gl
    descriptor.glProgram  or= gl.createProgram()
    descriptor.glVertex   or= gl.createShader GL_VERTEX_SHADER
    descriptor.glFragment or= gl.createShader GL_FRAGMENT_SHADER
    @compileShaders descriptor
    @relink descriptor
    unless gl.getProgramParameter descriptor.glProgram, GL_LINK_STATUS
      throw new Error "Could not initialize shader!\n\n"+ \
                        gl.getProgramInfoLog descriptor.glProgram

  bind: (context) ->
    descriptor = @getDescriptor context
    @validate context unless descriptor.valid
    {context, glProgram} = descriptor
    unless context._currentProgram is glProgram
      context.gl.useProgram glProgram
      context._currentProgram = glProgram

  getGLProgram: (context) ->
    @getDescriptor(context).glProgram

  vertexShaderChanged: =>
    @invalidate()
    @mergeVariables @vertex

  fragmentShaderChanged: =>
    @invalidate()
    @mergeVariables @fragment

  popularize: ->
    # decrease popularity of any variables previously used by this shader
    for name, ary of popularity
      if (index = ary.indexOf(@_guid)) isnt -1
        ary.splice ary.indexOf(@_guid), 1
    # increase popularity of all variables now used by this shader, which
    # have not been disabled during rendering
    for name, variable of @variables.attributes
      ary = popularity[name] or= []
      ary.push @_guid if @_dislikedAttributes.indexOf(name) is -1
    true

  mergeVariables: (shader) ->
    for name, variable of shader.variables
      clone = shallowClone variable
      switch variable.qualifier
        when 'attribute' then @variables.attributes[name] = clone
        when 'varying'   then @variables.varyings[name]   = clone
        when 'uniform'   then @variables.uniforms[name]   = clone
        else throw new Error "Unexpected qualifier: #{variable.qualifier}"
    @popularize()
    @variables

  validate: (context) ->
    descriptor = @getDescriptor context
    @compileProgram descriptor
    context._attributesEnabled or= {}
    descriptor.valid = true

  getDescriptor: (context) ->
    unless descriptor = @_contexts[context.id]
      descriptor = @_contexts[context.id] =
        valid: false
        context: context
      # console.log @variables
      maxAttrs = @getShaderContext(descriptor, 'vertex').maxVertexAttribs
      context._enabledAttributes or= new Uint8Array maxAttrs
    descriptor

  isValid: (context) ->
    @_contexts[context.id]?.valid

  invalidate: (context = null) =>
    if context
      @_contexts[context.id]?.valid = false
    else
      @invalidate descriptor.context for id, descriptor of @_contexts

  getShaderContext: (descriptor, shaderType) ->
    descriptor.shaderContexts or= {}
    descriptor.shaderContexts[shaderType] or= @newShaderContext descriptor, shaderType

  newShaderContext: (descriptor, shaderType) ->
    # TODO it'd be really cool if this tracked the number of each
    # that are actually in use, and then made available the difference, so
    # that a shader could alter its source code depending on the number
    # of uniforms/varyings/etc available to be used.
    {gl} = descriptor.context
    shaderType                  : shaderType
    maxVertexAttribs            : gl.getParameter gl.MAX_VERTEX_ATTRIBS
    maxVertexUniformVectors     : gl.getParameter gl.MAX_VERTEX_UNIFORM_VECTORS
    maxVaryingVectors           : gl.getParameter gl.MAX_VARYING_VECTORS
    maxCombinedTextureImageUnits: gl.getParameter gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
    maxVertexTextureImageUnits  : gl.getParameter gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
    maxFragmentTextureImageUnits: gl.getParameter gl.MAX_TEXTURE_IMAGE_UNITS
    maxFragmentUniformVectors   : gl.getParameter gl.MAX_FRAGMENT_UNIFORM_VECTORS
    shadingLanguageVersion      : gl.getParameter gl.SHADING_LANGUAGE_VERSION
    gl                          : gl

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
