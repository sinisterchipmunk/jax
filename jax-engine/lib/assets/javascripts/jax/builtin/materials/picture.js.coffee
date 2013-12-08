class Jax.Material.Picture extends Jax.Material.Custom
  Picture.prototype.shaders =
    common:   Jax.shaderTemplates['jax/builtin/shaders/picture/common']
    vertex:   Jax.shaderTemplates['jax/builtin/shaders/picture/vertex']
    fragment: Jax.shaderTemplates['jax/builtin/shaders/picture/fragment']

  registerBinding: (binding) ->
    {context, model, mesh} = binding
    binding.listen this, 'change:image', =>
      binding.set 'image', @get 'image'
    binding.listen mesh.data, 'change', ->
      mesh.data.set binding,
        vertices: 'VertexPosition'
        textures: 'TextureCoordinates'
    binding.on 'prepare', @matricesChanged

  matricesChanged: (event) =>
    {binding} = event
    {context, model, mesh} = binding
    binding.set 'ModelViewProjectionMatrix',
                context.matrix_stack.getModelViewProjectionMatrix()
