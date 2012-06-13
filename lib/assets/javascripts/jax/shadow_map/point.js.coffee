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
    @cullFace = GL_FRONT
    material.direction = 1
    super context, material, fbo
    
    @cullFace = GL_BACK
    material.direction = -1
    super context, material, @backFBO
  
  isDualParaboloid: -> true

  bindTextures: (context, vars, front, back) ->
    @validate context
    vars[front] = @shadowmapFBO.getTexture context, 0
    vars[back]  = @backFBO.getTexture      context, 0

  setupProjection: (projection, context) ->
    # the paraboloid will perform its own projection in the shader
    mat4.identity projection
    
    # first, find the most distance object from the light
    # mostDistant = 0
    # relative = vec3.create()
    # 
    # for id, obj of context.world.objects
    #   vec3.subtract @light.position, obj.camera.getPosition(), relative
    #   dist = vec3.length(relative) + obj.mesh.bounds.radius
    #   if dist > mostDistant then mostDistant = dist
    #   
    # # now use a small fraction of that distance as a range increment for
    # # calculating the effective range of this light. This doesn't have to
    # # be precise.
    # rangeIncrement = (mostDistant / 100) || 0.1
    # far = @light.maxEffectiveRange rangeIncrement
    # 
    # # account for infinite influence
    # if far is -1 then far = mostDistant
    # 
    # fov = 45
    # near = 0.1
    # aspect_ratio = @width / @height
    # 
    # mat4.perspective fov, aspect_ratio, near, far, projection
    # 
