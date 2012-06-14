#= require_self
#= require_tree './shadow_map'

class Jax.ShadowMap
  constructor: (@light) ->
    @_shadowMatrix = mat4.create()
    @_projectionMatrix = mat4.create()
    @_isValid = false
    @light.camera.addEventListener 'updated', => @invalidate()
    @biasMatrix = mat4.identity()
    @clearColor = [0, 0, 0, 0]
    @cullFace = GL_FRONT
    mat4.translate @biasMatrix, [0.5, 0.5, 0.5]
    mat4.scale     @biasMatrix, [0.5, 0.5, 0.5]
    
  @getter 'shadowMatrix', ->
    @validate() unless @isValid()
    @_shadowMatrix
    
  @getter 'projectionMatrix', ->
    @validate() unless @isValid()
    @_projectionMatrix
    
  bindTextures: (context, vars, texture1) ->
    vars[texture1] = @shadowmapFBO.getTexture context, 0
    
  ###
  Sets up the projection matrix used to render to the framebuffer object from the
  light's point of view. This method should be overridden by subclasses to construct
  the optimum view frustum for a particular type of light. For example, a spot light
  should constrain the view frustum to the light's spot radius, while a directional
  light should encompass the entire visible scene.
  ###
  setupProjection: (projection) ->
    throw new Error "ShadowMap type #{@__proto__.constructor.name} did not initialize its projection matrix!"
    
  validate: (context) ->
    if context and not @_isValid
      unless @_initialized
        # try to use a 1024x1024 framebuffer, but degrade gracefully if it's too big
        maxSize = context.gl.getParameter context.gl.MAX_RENDERBUFFER_SIZE
        maxSize = 1024 if maxSize > 1024
        @width = @height = maxSize
        @shadowmapFBO = new Jax.Framebuffer width: @width, height: @height, depth: true, color: GL_RGBA
        @_initialized = true

      @setupProjection @_projectionMatrix, context
      # shadowMatrix = bias * projection * modelview
      mat4.set @light.camera.getInverseTransformationMatrix(), @_shadowMatrix
      mat4.multiply @_projectionMatrix, @_shadowMatrix, @_shadowMatrix
      @_isValid = true
      @illuminate context
      # apply bias matrix only after illumination, so that it doesn't skew the illumination
      mat4.multiply @biasMatrix, @_shadowMatrix, @_shadowMatrix
    
  invalidate: -> @_isValid = @_isUpToDate = false
  
  dispose: (context) ->
    @shadowmapFBO?.dispose context
    @illuminationFBO?.dispose context
    
  isValid: -> @_isValid
  
  ###
  Applies the light's view and projection matrices, and resets the model matrix.
  ###
  setupMatrices: (stack) ->
    stack.loadModelMatrix mat4.IDENTITY
    stack.loadViewMatrix @shadowMatrix
    # don't use projection matrix because it's premultiplied into the shadow matrix
    stack.loadProjectionMatrix mat4.IDENTITY
    
  isDualParaboloid: -> false
  
  ###
  Renders the scene from the light's point of view. This method should be
  overridden by subclasses if they need a specialized render process (for
  example, rendering more than one pass).
  ###
  illuminate: (context, material = 'depthmap', fbo = @shadowmapFBO, capture = false) ->
    gl = context.gl
    clearColor = gl.getParameter GL_COLOR_CLEAR_VALUE
    fbo.bind context, =>
      fbo.viewport context
      gl.clearColor.apply gl, @clearColor
      gl.clear GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT
      gl.disable GL_BLEND
      # Push the depth values back so that they don't cause self-shadowing artifacts
      gl.enable GL_POLYGON_OFFSET_FILL
      gl.cullFace @cullFace
      gl.polygonOffset 2, 2
      context.matrix_stack.push()
      @setupMatrices context.matrix_stack
      context.world.render material
      context.matrix_stack.pop()
      if capture
        gl.readPixels 0, 0, @width, @height, GL_RGBA, GL_UNSIGNED_BYTE, @illuminationData
      
    # restore viewport
    gl.clearColor.apply gl, clearColor
    canvasWidth  = context.canvas.clientWidth  || context.canvas.width
    canvasHeight = context.canvas.clientHeight || context.canvas.height
    gl.viewport 0, 0, canvasWidth, canvasHeight
    gl.polygonOffset 0, 0
    gl.disable GL_POLYGON_OFFSET_FILL
    gl.cullFace GL_BACK
    gl.enable GL_BLEND
    
  illuminationArray = []
  isIlluminated: (model, context) ->
    @illuminationFBO or= new Jax.Framebuffer width: @width, height: @height, depth: true, color: GL_RGBA
    @illuminationData or= new Uint8Array @width * @height * 4
    @illuminate context, 'picking', @illuminationFBO, true
    context.world.parsePickData @illuminationData, illuminationArray
    return @illuminationArray.indexOf(model.__unique_id) != -1
    