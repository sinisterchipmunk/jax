class Jax.ShadowMap.Spot extends Jax.ShadowMap
  relative = vec3.create()

  setupProjection: (projection, context) ->
    # first, find the most distance object from the light
    mostDistant = 0
    
    for id, obj of context.world.getObjects()
      vec3.subtract relative, @light.position, obj.camera.position
      dist = vec3.length(relative) + obj.mesh?.bounds.radius
      if dist > mostDistant then mostDistant = dist
      
    # now use a small fraction of that distance as a range increment for
    # calculating the effective range of this light. This doesn't have to
    # be precise.
    rangeIncrement = (mostDistant / 100) || 0.1
    far = @light.maxEffectiveRange rangeIncrement

    # account for infinite influence
    if far is -1 then far = mostDistant

    fov = @light.outerSpotAngle * 180 / Math.PI * 2
    near = 0.1
    aspect_ratio = @width / @height

    mat4.perspective projection, fov, aspect_ratio, near, far
    
