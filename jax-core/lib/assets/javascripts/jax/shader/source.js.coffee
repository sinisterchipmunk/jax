#= require jax/mixins/event_emitter

class Jax.Shader.Source
  @include Jax.Mixins.EventEmitter

  constructor: ->
    @_templates = []

  insert: (index, templates...) ->
    @_templates.splice index, 0, templates...
    @trigger 'change'
    this

  append: (templates...) -> @insert @_templates.length, templates...

  remove: (index, count = 1) ->
    @_templates.splice index, count
    @trigger 'change'

  toString: (info) ->
    sources = for template in @_templates
      template info
    sources.join("\n\n")
