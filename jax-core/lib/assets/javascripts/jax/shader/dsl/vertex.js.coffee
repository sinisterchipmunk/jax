#= require jax/shader/dsl/top_level

class Jax.Shader.DSL.Vertex extends Jax.Shader.DSL.TopLevel
  builders: $.extend {}, Jax.Shader.DSL.builders,
    attributes: (command) -> @builders.define.call this, 'attribute', command

  constructor: (options) ->
    @attributes = new Jax.Shader.DSL.GlobalDefinitions
    super options

  addAttributes: (attributes) ->
    @addDefinition @attributes, attributes, "A_"
    @command 'attributes', attributes
