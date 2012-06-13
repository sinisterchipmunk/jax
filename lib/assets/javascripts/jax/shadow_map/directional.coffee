class Jax.ShadowMap.Directional extends Jax.ShadowMap
  setupProjection: (projection, context) ->
    @_center or= vec3.create()
    @_center[0] = @_center[1] = @_center[2] = 0
    count = 0
    for id, obj of context.world.objects
      continue unless obj.castShadow
      count += 1
      vec3.add obj.camera.getPosition(), @_center, @_center
      
    if count > 0
      vec3.scale @_center, 1 / count
      @light.camera.setPosition @_center
      
      sceneRadius = 0
      dist = vec3.create()
      for id, obj of context.world.objects
        continue unless obj.castShadow
        length = vec3.length(vec3.subtract @_center, obj.camera.getPosition(), dist) + obj.mesh.bounds.radius
        sceneRadius = length if sceneRadius < length
      
      mat4.ortho -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, projection
    else
      mat4.ortho -1, 1, -1, 1, -1, 1, projection
