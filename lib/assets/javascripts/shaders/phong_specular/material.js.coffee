class Jax.Material.PhongSpecular extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
  numPasses: -> 2
    
  setVariables: (context, mesh, model, vars, pass) ->
    mesh.data.set vars,
      vertices: 'VERTEX_POSITION'
      normals:  'VERTEX_NORMAL'
      
    vars.set
      MV: context.matrix_stack.getModelViewMatrix()
      PASS: pass
      MaterialShininess: 60
      MaterialAmbientIntensity: 1
      MaterialDiffuseIntensity: 1
      MaterialSpecularIntensity: 1
      MaterialDiffuseColor: new Jax.Color().toVec4()
      MaterialSpecularColor: new Jax.Color().toVec4()
      LightDiffuseColor: new Jax.Color().toVec4()
      LightSpecularColor: new Jax.Color().toVec4()
      WorldAmbientColor: new Jax.Color(0.3, 0.3, 0.3, 1).toVec4()
      EyeSpaceLightDirection: new Float32Array([0, -1, 0])
      EyeSpaceLightPosition: new Float32Array([0, 10, 0])
