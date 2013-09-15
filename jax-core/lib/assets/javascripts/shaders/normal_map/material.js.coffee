#= require_tree .
#= require 'shaders/texture/material'

class Jax.Material.Layer.NormalMap extends Jax.Material.Layer.Texture
  shaders:
    common:   Jax.shaderTemplates['shaders/normal_map/common']
    vertex:   Jax.shaderTemplates['shaders/normal_map/vertex']
    fragment: Jax.shaderTemplates['shaders/normal_map/fragment']

  constructor: (options) ->
    @specularChannel = !!(options && (options.specularChannel || \
                         (options.texture && options.texture.specularChannel)))
    super options
    @dataMap.tangents = 'VERTEX_TANGENT'
    @dataMap.normals = 'VERTEX_NORMAL'
    @dataMap.vertices = 'VERTEX_POSITION'

  setVariables: (context, mesh, model, vars, pass) ->
    super context, mesh, model, vars, pass
    vars.NormalMatrix = context.matrix_stack.getNormalMatrix()
    vars.UseSpecularChannel = @specularChannel
    # don't skip this pass!
    true
    