#= require_self
#= require_tree './shadow_map'

class Jax.ShadowMap
  constructor: (@light) ->
    @_shadowMatrix = mat4.create()
    @_projectionMatrix = mat4.create()
    @_isValid = false
    @light.camera.addEventListener 'matrixUpdated', => @invalidate()
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
    @validate context
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
    unless @_isValid
      unless @illuminationFBO
        # use the largest texture we can get away with, for best quality
        # some machines report framebuffer size larger than they can handle in practice,
        # so we'll start at the reported size and then bit-shift downward until we reach
        # a valid size. If we have to go lower than 128x128 then something else is wrong.
        maxSize = context.gl.getParameter context.gl.MAX_RENDERBUFFER_SIZE
        
        # Actually both firefox and chrome currently crash to desktop when I do this,
        # at least on my MBP, which reports size 8192. For now I'll just go with some
        # known good value. Size 4096 doesn't crash browser, but loses the WebGL context.
        knownGood = 2048
        maxSize = knownGood if maxSize > knownGood
        
        done = false
        while !done
          try
            width = height = maxSize
            @illuminationFBO = new Jax.Framebuffer width: width, height: height, depth: true, color: GL_RGBA
            @illuminationFBO.validate context
            done = true
          catch e
            @illuminationFBO.dispose context
            if maxSize <= 128
              throw new Error "Couldn't negotiate acceptable renderbuffer size: #{e}"
            else
              newSize = maxSize >> 1
              console.log "Warning: renderbuffer size #{maxSize} wasn't accepted, trying #{newSize}"
              maxSize = newSize
        @width or= maxSize
        @height or= maxSize
        @shadowmapFBO = new Jax.Framebuffer width: @width, height: @height, depth: true, color: GL_RGBA
        @illuminationData = new Uint8Array @width * @height * 4

      @setupProjection @_projectionMatrix, context
      # shadowMatrix = bias * projection * modelview
      mat4.set @light.camera.getInverseTransformationMatrix(), @_shadowMatrix
      mat4.multiply @_projectionMatrix, @_shadowMatrix, @_shadowMatrix
      @_isValid = true
      @illuminate context
      # after rendering, bias the matrix to produce coords in range [0,1] instead of [-1,1]
      mat4.multiply @biasMatrix, @_shadowMatrix, @_shadowMatrix
    
  invalidate: -> @_isValid = @_isUpToDate = false
    
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
    gl.viewport 0, 0, context.canvas.clientWidth, context.canvas.clientHeight
    gl.polygonOffset 0, 0
    gl.disable GL_POLYGON_OFFSET_FILL
    gl.cullFace GL_BACK
    gl.enable GL_BLEND
    
  isIlluminated: (model, context) ->
    @illuminationArray or= []
    @illuminate context, 'picking', @illuminationFBO, true
    context.world.parsePickData @illuminationData, @illuminationArray
    return @illuminationArray.indexOf(model.__unique_id) != -1
    