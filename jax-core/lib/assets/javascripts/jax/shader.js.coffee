#= require 'jax/mixins/event_emitter'
#= require_self
#= require_tree './shader'

class Jax.Shader
  @include Jax.Mixins.EventEmitter

  class Shader.CompileError extends Jax.Error
    constructor: (message) ->
      super()
      @message = message

  ###
  Returns a static, generic descriptor. Descriptors normally contain
  information about the capabilities of the underlying renderer. The result
  of this method a descriptor containing _fake_ capabilities. This way,
  shader templates that produce different source depending on a renderer's
  capabilities can be generated even if the real capabilities are not yet
  known.

  Because the descriptor does not contain real information, you should not
  assume anything produced using the descriptor values is actually valid.

  The actual values returned by the generic descriptor are set to the smallest
  and least-capable values that still abide by the WebGL standard.
  ###
  @getGenericDescriptor: ->
    maxVertexTextureImageUnits  : 0
    maxFragmentTextureImageUnits: 8
    maxCombinedTextureImageUnits: 8
    maxVertexAttribs            : 8
    maxVertexUniformVectors     : 128
    maxVaryingVectors           : 8
    maxFragmentUniformVectors   : 16
    maxDrawBuffers              : 1
    shadingLanguageVersion      : 1

  ###
  Used by `Jax.Material` to prevent instantiating a specific shader more than
  once.
  ###
  @instances: []

  shallowClone = (obj) ->
    clone = {}
    clone[k] = v for k, v of obj
    clone

  constructor: (@name = "generic") ->
    @popularityContest = new Jax.Shader.PopularityContest
    @_contexts = {}
    @_guid = Jax.guid()
    @vertex   = new Jax.Shader.Source
    @fragment = new Jax.Shader.Source

    @variables =
      attributes: {}
      uniforms:   {}
      varyings:   {}
    @vertex.on   'change', @invalidate
    @fragment.on 'change', @invalidate

  ###
  Sets the shader's variables according to the name/value pairs which appear
  in the given `assigns` object. An error will be raised if any named 
  variable does not exist. If the program has not already been compiled and 
  activated, an error is raised.
  ###
  set: (context, assigns) ->
    @validate context
    gl = context.renderer
    mustRebind = false
    for name, attribute of @variables.attributes
      continue if name is 'definitions'
      if (value = assigns[name]) isnt undefined
        @setAttribute context, attribute, value
      else
        # console.log 'not using', name
        id = context.id
        if @isAttributeEnabled context, attribute.location
          if attribute.location is 0 and not @popularityContest.isDisliked(name)
            # console.log 'disliking', name
            # make a note that this attribute was disabled; finish iterating
            # in case other attributes follow suit; then rebind and retry
            @popularityContest.dislike name
            mustRebind = true
          # console.log 'disabling', name
          @disableAttribute context, attribute.location, attribute.name
      attribute.value = value
    if mustRebind
      descriptor = @getDescriptor context
      @popularityContest.popularize @variables.attributes.definitions
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
    unless @isAttributeEnabled context, variable.location
      @enableAttribute context, variable.location, variable.name
    value.bind context
    context.renderer.vertexAttribPointer variable.location,
                                         value.itemSize,
                                         value.dataType || GL_FLOAT,
                                         false,
                                         0,
                                         value.offset || 0

  setUniform: (context, variable, value) ->
    gl = context.renderer
    id = context.id
    switch variable.type
      when GL_FLOAT          then gl.uniform1f  variable.location, value
      when GL_BOOL, GL_INT    then gl.uniform1i  variable.location, value
      when GL_FLOAT_VEC2           then gl.uniform2fv variable.location, value
      when GL_FLOAT_VEC3           then gl.uniform3fv variable.location, value
      when GL_FLOAT_VEC4           then gl.uniform4fv variable.location, value
      when GL_BOOL_VEC2, GL_INT_VEC2 then gl.uniform2iv variable.location, value
      when GL_BOOL_VEC3, GL_INT_VEC3 then gl.uniform3iv variable.location, value
      when GL_BOOL_VEC4, GL_INT_VEC4 then gl.uniform4iv variable.location, value
      when GL_FLOAT_MAT2 then gl.uniformMatrix2fv variable.location, false, value
      when GL_FLOAT_MAT3 then gl.uniformMatrix3fv variable.location, false, value
      when GL_FLOAT_MAT4 then gl.uniformMatrix4fv variable.location, false, value
      when GL_SAMPLER_2D, GL_SAMPLER_CUBE
        gl.activeTexture GL_TEXTURE0 + @__textureIndex
        if handle = value.validate context
          gl.bindTexture value.get('target'), handle
        else
          gl.bindTexture value.get('target'), null
        gl.uniform1i variable.location, value = @__textureIndex++
      else
        throw new Error "Unexpected variable type: #{Jax.Util.enumName variable.type}"

  insert: (vsrc, fsrc, index) ->
    @vertex.insert   vsrc, index
    @fragment.insert fsrc, index

  append: (vsrc, fsrc, index) ->
    @vertex.append vsrc
    @fragment.append fsrc

  clear: ->
    @vertex.reset()
    @fragment.reset()

  bindAttributeLocations: (descriptor) ->
    gl = descriptor.context.renderer
    # sort variables used by this shader, in descending order of popularity
    # and secondarily alphabetically, so that they have a very predictable
    # order of appearance. This will help reduce attribute switching.
    #
    # Any attributes which have been explicitly disliked, will be filtered
    # downward. This doesn't mean they can't be chosen, but that attributes
    # which have never been disabled have the best chance of selection for
    # slot 0.
    variableNames = @variables.attributes.definitions
    @popularityContest.sort variableNames
    nextAvailableLocation = 0
    id = descriptor.context.id
    for name in variableNames
      variable = @variables.attributes[name]
      variable.location = nextAvailableLocation
      gl.bindAttribLocation descriptor.glProgram,
                            nextAvailableLocation,
                            variable.name
      nextAvailableLocation += switch variable.type
        when 'mat2' then 2
        when 'mat3' then 3
        when 'mat4' then 4
        else 1
    true

  enableAllAttributes: (descriptor) ->
    id = descriptor.context.id
    for name, variable of @variables.attributes
      @enableAttribute descriptor.context, variable.location, name
    true

  enableAttribute: (context, location, name) ->
    context._enabledAttributes[location] = 1
    context.renderer.enableVertexAttribArray location

  disableAttribute: (context, location, name) ->
    context._enabledAttributes[location] = 0
    context.renderer.disableVertexAttribArray location

  isAttributeEnabled: (context, location) ->
    context._enabledAttributes[location] is 1

  getUniformLocations: (descriptor) ->
    gl = descriptor.context.renderer
    program = descriptor.glProgram
    id = descriptor.context.id
    for name, variable of @variables.uniforms
      variable.location = gl.getUniformLocation program, name
    true

  relink: (descriptor) ->
    # link twice: first to get active uniforms and attributes,
    # then to appliy attribute bindings based on the popularity contest
    gl = descriptor.context.renderer
    gl.linkProgram descriptor.glProgram
    @queryShaderVariables descriptor
    @bindAttributeLocations descriptor
    gl.linkProgram descriptor.glProgram
    @enableAllAttributes descriptor
    @getUniformLocations descriptor

  queryShaderVariables: (descriptor) ->
    gl = descriptor.context.renderer
    program = descriptor.glProgram
    numAttributes = gl.getProgramParameter program, GL_ACTIVE_ATTRIBUTES
    numUniforms   = gl.getProgramParameter program, GL_ACTIVE_UNIFORMS
    @variables.attributes.definitions = []
    for i in [0...numAttributes]
      if attribute = gl.getActiveAttrib program, i
        @variables.attributes.definitions.push attribute.name
        @variables.attributes[attribute.name] =
          name: attribute.name
          size: attribute.size
          type: attribute.type
    for i in [0...numUniforms]
      if uniform = gl.getActiveUniform program, i
        name = uniform.name
        for n in [0...(uniform.size || 1)]
          name = uniform.name.replace(/\[0\]$/, "[#{n}]")
          @variables.uniforms[name] =
            name: name
            size: uniform.size
            type: uniform.type
    true

  compileShader: (descriptor, type, jaxShader, glShader, sourceHelper) ->
    gl = descriptor.context.renderer
    sourceHelper.shaderType = type
    source = jaxShader.toString sourceHelper
    # @currentVertexSource = source
    @["current#{type.charAt(0).toUpperCase()+type[1..-1]}Source"] = source
    gl.shaderSource glShader, source
    gl.compileShader glShader
    unless gl.getShaderParameter glShader, GL_COMPILE_STATUS
      backtrace = @buildBacktrace gl, glShader, source.split(/\n/)
      if backtrace.length == 1 and backtrace[0].length == 0
        backtrace = source
      throw new Jax.Shader.CompileError "Shader #{jaxShader.name} failed to compile\n\n#{backtrace.join("\n")}"
    glShader

  compileShaders: (descriptor) ->
    {context, glVertex, glFragment} = descriptor
    info = @getShaderContext descriptor, 'vertex'
    helper = new Jax.Material.SourceHelper info

    gl = context.renderer
    @compileShader descriptor, 'vertex',   @vertex,   glVertex,   helper
    @compileShader descriptor, 'fragment', @fragment, glFragment, helper

  compileProgram: (descriptor) ->
    gl = descriptor.context.renderer
    unless descriptor.glProgram
      descriptor.glProgram  = gl.createProgram()
      descriptor.glVertex   = gl.createShader GL_VERTEX_SHADER
      descriptor.glFragment = gl.createShader GL_FRAGMENT_SHADER
      gl.attachShader descriptor.glProgram, descriptor.glVertex
      gl.attachShader descriptor.glProgram, descriptor.glFragment
    @compileShaders descriptor
    @relink descriptor
    unless gl.getProgramParameter descriptor.glProgram, GL_LINK_STATUS
      throw new Error [ "Could not initialize shader!"
                        gl.getProgramInfoLog(descriptor.glProgram)
                        @currentVertexSource
                        @currentFragmentSource
                      ].join("\n\n")

  bind: (context) ->
    descriptor = @getDescriptor context
    @validate context unless descriptor.valid
    {context, glProgram} = descriptor
    unless context._currentProgram is glProgram
      context.renderer.useProgram glProgram
      context._currentProgram = glProgram

  getGLProgram: (context) ->
    @getDescriptor(context).glProgram

  validate: (context) ->
    descriptor = @getDescriptor context
    return if descriptor.valid
    @compileProgram descriptor
    context._attributesEnabled or= {}
    descriptor.valid = true

  getDescriptor: (context) ->
    unless descriptor = @_contexts[context.id]
      descriptor = @_contexts[context.id] =
        valid: false
        context: context
      maxAttrs = @getShaderContext(descriptor).maxVertexAttribs
      context._enabledAttributes or= new Uint8Array maxAttrs
    descriptor

  isValid: (context) ->
    @getDescriptor(context).valid

  invalidate: (context = null) =>
    if context
      @getDescriptor(context).valid = false
    else
      @invalidate descriptor.context for id, descriptor of @_contexts

  getShaderContext: (descriptor) ->
    # TODO it'd be really cool if this tracked the number of each
    # that are actually in use, and then made available the difference, so
    # that a shader could alter its source code depending on the number
    # of uniforms/varyings/etc available to be used.
    gl = descriptor.context.renderer
    descriptor.shaderContext or=
      maxVertexAttribs            : gl.getParameter GL_MAX_VERTEX_ATTRIBS
      maxVertexUniformVectors     : gl.getParameter GL_MAX_VERTEX_UNIFORM_VECTORS
      maxVaryingVectors           : gl.getParameter GL_MAX_VARYING_VECTORS
      maxCombinedTextureImageUnits: gl.getParameter GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS
      maxVertexTextureImageUnits  : gl.getParameter GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS
      maxFragmentTextureImageUnits: gl.getParameter GL_MAX_TEXTURE_IMAGE_UNITS
      maxFragmentUniformVectors   : gl.getParameter GL_MAX_FRAGMENT_UNIFORM_VECTORS
      shadingLanguageVersion      : gl.getParameter GL_SHADING_LANGUAGE_VERSION
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
