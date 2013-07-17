Jax.views.push "picking/index", ->
  @context.renderer.clear()
  @context.world.render()
  @context.gl.depthFunc @context.gl.LEQUAL
  if @context.controller.picked
    @context.controller.picked.render @context, "default"
