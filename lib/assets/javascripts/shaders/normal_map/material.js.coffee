class Jax.Material.NormalMap extends Jax.Material.Layer
  constructor: (options, material) ->
    if options instanceof Jax.Texture then @map = options
    else if options?.instance then @map = options.instance
    else @map = new Jax.Texture options

    super {shader: "normal_map"}, material
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.set
      NormalMap: @map
      VERTEX_TANGENT: mesh.getTangentBuffer()
