class Jax.ShadowMap.Directional extends Jax.ShadowMap
  
  center = vec3.create()
  setupProjection: (projection, context) ->
    center[0] = center[1] = center[2] = 0
    count = 0
    for obj in context.world.getObjects()
      continue unless obj.castShadow
      count += 1
      vec3.add center, obj.camera.get('position'), center
      
    if count > 0
      vec3.scale center, center, 1 / count
      @light.camera.setPosition center
      
      sceneRadius = 0
      dist = vec3.create()
      for obj in context.world.getObjects()
        continue unless obj.castShadow
        length = vec3.length(vec3.subtract dist, center, obj.camera.get('position')) + obj.mesh?.bounds.radius
        sceneRadius = length if sceneRadius < length
      
      sceneRadius = 1 if sceneRadius is 0
      sceneRadius += 0.1 # ensure there is a border around the texture
      mat4.ortho projection, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius
    else
      mat4.ortho projection, -1, 1, -1, 1, -1, 1
