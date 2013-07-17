class Jax.Mesh.TriangleStrip extends Jax.Mesh.Base
  @include Jax.Mesh.Tangents
  @include Jax.Mesh.Normals
  
  constructor: (args...) ->
    @draw_mode or= GL_TRIANGLE_STRIP
    super args...
    @triangleOrder = []
    @addEventListener 'validated', => @updateTriangleOrder()
    
  updateTriangleOrder: ->
    triangleOrder = @triangleOrder
    indices = @data.indexBuffer
    numIndices = indices.length
    triangleOrder.splice 0, triangleOrder.length
    for i in [2...numIndices] by 2
      triangleOrder.push indices[i-2], indices[i-1], indices[i  ]
      if i < numIndices - 1
        triangleOrder.push indices[i  ], indices[i-1], indices[i+1]
