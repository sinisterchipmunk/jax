class Jax.Material.PhongSpecular extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshDataMap =
      vertices: 'VERTEX_POSITION'
      normals: 'VERTEX_NORMAL'
    @varMap = {}
    
  numPasses: -> 2
    
  setVariables: (context, mesh, model, vars, pass) ->
    @varMap.ModelViewMatrix = context.matrix_stack.getModelViewMatrix()
    @varMap.NormalMatrix = context.matrix_stack.getNormalMatrix()
    @varMap.PASS = pass
    @varMap.MaterialShininess = 60
    @varMap.MaterialSpecularIntensity = 1
    @varMap.MaterialSpecularColor = new Jax.Color()
    @varMap.LightSpecularColor = new Jax.Color()
    @varMap.EyeSpaceLightDirection = vec3.normalize(new Float32Array([-1, -1, -1]))
    
    mesh.data.set vars, @meshDataMap
    vars.set @varMap
