#= require jax/material/surface
#= require jax/mesh/data

class Jax.Material.Wire extends Jax.Material.Surface
  Wire.prototype.shaders =
    common:   Jax.shaderTemplates['shaders/wire/common']
    vertex:   Jax.shaderTemplates['shaders/wire/vertex']
    fragment: Jax.shaderTemplates['shaders/wire/fragment']

  # p2verts and p3verts will store the (xyz) of P2 and P3 for every
  # vertex P1. The (w) of P2 will store the vertex ID (0,1,2).
  Jax.Mesh.Data.endpoints.p2verts = 4
  Jax.Mesh.Data.endpoints.p3verts = 3

  constructor: (options) ->
    super options
    @transparent = true
    @set 'transparent', true
    @_winScale = [0, 0]

  wireMesh: (mesh) ->
    # For the wireframe to work, each index must point to a unique vertex
    # even if it means duplicating some data -- this is because for each
    # vertex A, there are two opposite vertices B and C that must also
    # be sent down, and these opposite vertices will be different at each
    # index.
    indexBuffer = mesh.data.indexBuffer
    colorBuffer = mesh.data.colorBuffer
    normalBuffer = mesh.data.normalBuffer
    textureCoordsBuffer = mesh.data.textureCoordsBuffer
    vertexBuffer = mesh.data.vertexBuffer
    
    data = new Jax.Mesh.Data indexBuffer.length * 3
    data.wired = true
    for i in [0...indexBuffer.length] by 3
      [i1, i2, i3] = [i, i+1, i+2]
      [b1, b2, b3] = [indexBuffer[i1], indexBuffer[i2], indexBuffer[i3]]
      [v1, v2, v3] = [b1*3, b2*3, b3*3]
      [c1, c2, c3] = [b1*4, b2*4, b3*4]
      [t1, t2, t3] = [b1*2, b2*2, b3*3]
      # v1
      data.vertexBuffer[i1*3  ] = vertexBuffer[v1  ]
      data.vertexBuffer[i1*3+1] = vertexBuffer[v1+1]
      data.vertexBuffer[i1*3+2] = vertexBuffer[v1+2]
      data.normalBuffer[i1*3  ] = normalBuffer[v1  ]
      data.normalBuffer[i1*3+1] = normalBuffer[v1+1]
      data.normalBuffer[i1*3+2] = normalBuffer[v1+2]
      data.colorBuffer[i1*4  ] = colorBuffer[c1  ]
      data.colorBuffer[i1*4+1] = colorBuffer[c1+1]
      data.colorBuffer[i1*4+2] = colorBuffer[c1+2]
      data.colorBuffer[i1*4+3] = colorBuffer[c1+3]
      data.textureCoordsBuffer[i1*2  ] = textureCoordsBuffer[t1  ]
      data.textureCoordsBuffer[i1*2+1] = textureCoordsBuffer[t1+1]
      data.p2verts[i1*4  ] = vertexBuffer[v2  ]
      data.p2verts[i1*4+1] = vertexBuffer[v2+1]
      data.p2verts[i1*4+2] = vertexBuffer[v2+2]
      data.p2verts[i1*4+3] = 0
      data.p3verts[i1*3  ] = vertexBuffer[v3  ]
      data.p3verts[i1*3+1] = vertexBuffer[v3+1]
      data.p3verts[i1*3+2] = vertexBuffer[v3+2]
      # v2
      data.vertexBuffer[i2*3  ] = vertexBuffer[v2  ]
      data.vertexBuffer[i2*3+1] = vertexBuffer[v2+1]
      data.vertexBuffer[i2*3+2] = vertexBuffer[v2+2]
      data.normalBuffer[i2*3  ] = normalBuffer[v2  ]
      data.normalBuffer[i2*3+1] = normalBuffer[v2+1]
      data.normalBuffer[i2*3+2] = normalBuffer[v2+2]
      data.colorBuffer[i2*4  ] = colorBuffer[c2  ]
      data.colorBuffer[i2*4+1] = colorBuffer[c2+1]
      data.colorBuffer[i2*4+2] = colorBuffer[c2+2]
      data.colorBuffer[i2*4+3] = colorBuffer[c2+3]
      data.textureCoordsBuffer[i2*2  ] = textureCoordsBuffer[t2  ]
      data.textureCoordsBuffer[i2*2+1] = textureCoordsBuffer[t2+1]
      data.p2verts[i2*4  ] = vertexBuffer[v3  ]
      data.p2verts[i2*4+1] = vertexBuffer[v3+1]
      data.p2verts[i2*4+2] = vertexBuffer[v3+2]
      data.p2verts[i2*4+3] = 1
      data.p3verts[i2*3  ] = vertexBuffer[v1  ]
      data.p3verts[i2*3+1] = vertexBuffer[v1+1]
      data.p3verts[i2*3+2] = vertexBuffer[v1+2]
      # v3
      data.vertexBuffer[i3*3  ] = vertexBuffer[v3  ]
      data.vertexBuffer[i3*3+1] = vertexBuffer[v3+1]
      data.vertexBuffer[i3*3+2] = vertexBuffer[v3+2]
      data.normalBuffer[i3*3  ] = normalBuffer[v3  ]
      data.normalBuffer[i3*3+1] = normalBuffer[v3+1]
      data.normalBuffer[i3*3+2] = normalBuffer[v3+2]
      data.colorBuffer[i3*4  ] = colorBuffer[c3  ]
      data.colorBuffer[i3*4+1] = colorBuffer[c3+1]
      data.colorBuffer[i3*4+2] = colorBuffer[c3+2]
      data.colorBuffer[i3*4+3] = colorBuffer[c3+3]
      data.textureCoordsBuffer[i3*2  ] = textureCoordsBuffer[t3  ]
      data.textureCoordsBuffer[i3*2+1] = textureCoordsBuffer[t3+1]
      data.p2verts[i3*4  ] = vertexBuffer[v1  ]
      data.p2verts[i3*4+1] = vertexBuffer[v1+1]
      data.p2verts[i3*4+2] = vertexBuffer[v1+2]
      data.p2verts[i3*4+3] = 2
      data.p3verts[i3*3  ] = vertexBuffer[v2  ]
      data.p3verts[i3*3+1] = vertexBuffer[v2+1]
      data.p3verts[i3*3+2] = vertexBuffer[v2+2]
    mesh.data = data

  registerBinding: (binding) ->
    super binding
    {context, mesh} = binding
    @wireMesh mesh unless mesh?.data.wired
    binding.listen mesh, 'change:data', ->
      mesh.data.set binding,
        p2verts: 'p1_3d'
        p3verts: 'p2_3d'
    binding.set 'WIN_SCALE', [context.canvas.width/2, context.canvas.height/2]
