class Jax.Material.LambertDiffuse extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
    @varMap = {}
    
  numPasses: -> 2
    
  setVariables: (context, mesh, model, vars, pass) ->
    @varMap.NormalMatrix = context.matrix_stack.getNormalMatrix()
    @varMap.PASS = pass
    @varMap.MaterialDiffuseIntensity = 1
    @varMap.MaterialDiffuseColor = Jax.Color.parse("#c99")
    @varMap.LightDiffuseColor = new Jax.Color()
    @varMap.EyeSpaceLightDirection = vec3.normalize(new Float32Array([-1, -1, -1]))
    
    mesh.data.set vars, @meshDataMap
    vars.set @varMap
