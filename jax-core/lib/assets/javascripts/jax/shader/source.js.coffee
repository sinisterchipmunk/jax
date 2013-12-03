#= require jax/mixins/event_emitter

class Jax.Shader.Source
  @include Jax.Mixins.EventEmitter

  constructor: ->
    @_templates = []
    @_default = "void main(void) { }"

  insert: (index, templates...) ->
    @_templates.splice index, 0, templates...
    @trigger 'change'
    this

  append: (templates...) -> @insert @_templates.length, templates...

  remove: (index, count = 1) ->
    @_templates.splice index, count
    @trigger 'change'

  toString: (info) ->
    sources = (@runTemplate template, info for template in @_templates)
    sources.push @runTemplate @_default, info unless sources.length
    sources.join("\n\n")

  default: (source) ->
    @_default = source

  runTemplate: (template, info) ->
    if typeof template is 'string' then template
    else template info
