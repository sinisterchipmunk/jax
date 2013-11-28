class Jax.Shader.DSL.TopLevel extends Jax.Shader.DSL
  constructor: (options) ->
    super options
    @uniforms   = new Jax.Shader.DSL.GlobalDefinitions
    @varyings   = new Jax.Shader.DSL.GlobalDefinitions

