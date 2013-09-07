class Jax.ShadowMap.Point extends Jax.ShadowMap
  constructor: (args...) ->
    super args...
    @clearColor = [0, 0, 0, 0]
    # we don't use a bias, it will mess up the paraboloid
    mat4.identity @biasMatrix
  
  illuminate: (context, material = 'paraboloid-depthmap', fbo = @shadowmapFBO) ->
    unless @backFBO
      @backFBO = new Jax.Framebuffer width: @width, height: @height, depth: true, color: GL_RGBA
    
    material = Jax.Material.find material
    layer = material.findLayer Jax.Material.Layer.Paraboloid
    layer.paraboloidNear = @paraboloidNear
    layer.paraboloidFar  = @paraboloidFar
    
    @cullFace = GL_FRONT
    layer.direction = 1
    super context, material, fbo
    
    @cullFace = GL_BACK
    layer.direction = -1
    super context, material, @backFBO
    
  dispose: (context) ->
    super context
    @backFBO?.dispose context
  
  isDualParaboloid: -> true

  bindTextures: (context, vars, front, back) ->
    super context, vars, front
    vars[back]  = @backFBO.getTexture      context, 0

  relative = vec3.create()
  setupProjection: (projection, context) ->
    # the paraboloid will perform its own projection in the shader
    mat4.identity projection
    
    # now calculate zNear and zFar for the paraboloid
    mostDistant = 0
    
    # first, find the most distant object from the light
    for id, obj of context.world.getObjects()
      vec3.subtract relative, @light.position, obj.camera.get('position')
      dist = vec3.length(relative) + obj.mesh?.bounds.radius
      if dist > mostDistant then mostDistant = dist
      
    # now use a small fraction of that distance as a range increment for
    # calculating the effective range of this light. This doesn't have to
    # be precise.
    rangeIncrement = (mostDistant / 100) || 0.1
    far = @light.maxEffectiveRange rangeIncrement
    
    # account for infinite influence
    if far is -1 then far = mostDistant
    
    @paraboloidNear = 0.1
    @paraboloidFar = far
    
