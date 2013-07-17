class Jax.Material.Layer.Texture extends Jax.Material.Layer
  constructor: (options) ->
    if options and options.instance then texture = options.instance
    else if options and options.texture then texture = options.texture
    else if options then texture = options
    texture = new Jax.Texture texture unless texture instanceof Jax.Texture
    
    super shader: options?.shader
    @texture = texture
    @dataMap = textures: 'VERTEX_TEXCOORDS'
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.TextureScaleX = @texture.options.scale_x || @texture.options.scale || 1
    vars.TextureScaleY = @texture.options.scale_y || @texture.options.scale || 1
    vars.Texture = @texture
    mesh.data.set vars, @dataMap
