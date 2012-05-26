class Jax.Material.Basic extends Jax.Material.Layer
  constructor: (options, material) ->
    @ambient = new Float32Array([1, 1, 1, 1])
    @diffuse = new Float32Array([1, 1, 1, 1])
    @specular = new Float32Array([1, 1, 1, 1])
    @vnMatrix = mat3.create()
    super options, material
    
  setVariables: (context, mesh, model, vars) ->
    stack = context.matrix_stack
    mat3.transpose mat4.toMat3 stack.getViewMatrix(), @vnMatrix
    
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
      normals:  'VERTEX_NORMAL'
      vertices: 'VERTEX_POSITION'
      textures: 'VERTEX_TEXCOORDS'
    
    vars.set
      ivMatrix: stack.getInverseViewMatrix()
      mvMatrix: stack.getModelViewMatrix()
      nMatrix: stack.getNormalMatrix()
      pMatrix: stack.getProjectionMatrix()
      vnMatrix: @vnMatrix
      materialAmbient: @ambient
      materialDiffuse: @diffuse
      materialSpecular: @specular
      materialShininess: 1