class Jax.ShadowMap.Directional extends Jax.ShadowMap
  
  center = vec3.create()
  setupProjection: (projection, context) ->
    center[0] = center[1] = center[2] = 0
    count = 0
    for obj in context.world.getObjects()
      continue unless obj.castShadow
      count += 1
      vec3.add obj.camera.position, center, center
      
    if count > 0
      vec3.scale center, 1 / count
      @light.camera.setPosition center
      
      sceneRadius = 0
      dist = vec3.create()
      for obj in context.world.getObjects()
        continue unless obj.castShadow
        length = vec3.length(vec3.subtract center, obj.camera.position, dist) + obj.mesh?.bounds.radius
        sceneRadius = length if sceneRadius < length
      
      mat4.ortho -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, projection
    else
      mat4.ortho -1, 1, -1, 1, -1, 1, projection
