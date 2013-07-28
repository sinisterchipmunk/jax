class Jax.Mesh.TriangleFan extends Jax.Mesh.Base
  @include Jax.Mesh.Tangents
  @include Jax.Mesh.Normals
  
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLE_FAN
    super args...
    @triangleOrder = []
    @on 'validated', => @updateTriangleOrder()
    
  updateTriangleOrder: ->
    triangleOrder = @triangleOrder
    indices = @data.indexBuffer
    numIndices = indices.length
    triangleOrder.splice 0, triangleOrder.length
    for i in [2...numIndices] 
      triangleOrder.push indices[0], indices[i-1], indices[i]
