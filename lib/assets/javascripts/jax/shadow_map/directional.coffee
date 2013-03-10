class Jax.ShadowMap.Directional extends Jax.ShadowMap
  
  center = GLMatrix.vec3.create()
  setupProjection: (projection, context) ->
    center[0] = center[1] = center[2] = 0
    count = 0
    for obj in context.world.getObjects()
      continue unless obj.castShadow
      count += 1
      GLMatrix.vec3.add center, obj.camera.position, center
      
    if count > 0
      GLMatrix.vec3.scale center, center, 1 / count
      @light.camera.position = center
      
      sceneRadius = 0
      dist = GLMatrix.vec3.create()
      for obj in context.world.getObjects()
        continue unless obj.castShadow
        length = GLMatrix.vec3.length(GLMatrix.vec3.subtract dist, center, obj.camera.position) + obj.mesh?.bounds.radius
        sceneRadius = length if sceneRadius < length
      
      sceneRadius = 1 if sceneRadius is 0
      GLMatrix.mat4.ortho projection, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius
    else
      GLMatrix.mat4.ortho projection, -1, 1, -1, 1, -1, 1
