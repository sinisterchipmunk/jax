Jax.views.push "picking/index", ->
  @context.renderer.clear()
  @context.world.render()
  @context.renderer.depthFunc GL_LEQUAL
  if @context.controller.picked
    @context.controller.picked.render @context, "default"
