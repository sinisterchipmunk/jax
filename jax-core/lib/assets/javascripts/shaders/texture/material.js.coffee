#= require_tree .

class Jax.Material.Layer.Texture extends Jax.Material.Layer
  shaders:
    common:   Jax.shaderTemplates['shaders/texture/common']
    vertex:   Jax.shaderTemplates['shaders/texture/vertex']
    fragment: Jax.shaderTemplates['shaders/texture/fragment']

  constructor: (options) ->
    if options and options.instance then texture = options.instance
    else if options and options.texture then texture = options.texture
    else if options then texture = options
    texture = new Jax.Texture.Bitmap texture unless texture instanceof Jax.Texture

    super shader: options?.shader
    @texture = texture
    @dataMap = textures: 'VERTEX_TEXCOORDS'
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.TextureScaleX = @texture.get('scale_x') || @texture.get('scale') || 1
    vars.TextureScaleY = @texture.get('scale_y') || @texture.get('scale') || 1
    vars.Texture = @texture
    mesh.data.set vars, @dataMap
