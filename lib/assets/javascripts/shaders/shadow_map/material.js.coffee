class Jax.Material.ShadowMap extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    @meshMap = vertices: 'VERTEX_POSITION'
  
  numPasses: (context) -> context.world.lights.length + 1
  
  prepare: (context, mesh, model) ->
    for i in [1...@numPasses(context)]
      light = context.world.lights[i-1]
      if light.shadows and light.shadowmap then light.shadowmap.validate context
    true
  
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    vars['SHADOWMAP_ENABLED[0]'] = false
    return unless pass
    
    light = context.world.lights[pass-1]
    vars['SHADOWMAP_ENABLED[0]'] = light.shadows && !!light.shadowmap && model.receiveShadow
    
    vars.mMatrix = context.matrix_stack.getModelMatrix()
    mesh.data.set vars, @meshMap

    if vars['SHADOWMAP_ENABLED[0]']
      vars['ParaboloidNear[0]'] = light.shadowmap.paraboloidNear || 1
      vars['ParaboloidFar[0]']  = light.shadowmap.paraboloidFar  || 200
      vars['SHADOWMAP_PCF_ENABLED[0]'] = false
      vars['SHADOWMAP_MATRIX[0]'] = light.shadowmap.shadowMatrix
      vars['SHADOWMAP_WIDTH[0]'] = light.shadowmap.width
      vars['SHADOWMAP_HEIGHT[0]'] = light.shadowmap.height
      vars['IsDualParaboloid[0]'] = light.shadowmap.isDualParaboloid()
      light.shadowmap.bindTextures context, vars, 'SHADOWMAP0[0]', 'SHADOWMAP1[0]'
