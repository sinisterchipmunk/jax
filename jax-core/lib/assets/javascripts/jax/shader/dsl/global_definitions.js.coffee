###
A collection of top-level definitions such as varyings, uniforms or
attributes. These can be referenced as part of the DSL. They serve two
purposes: first, a convenience since any global that has already been defined
can be referenced without needing to encapsulate it in a string; and second,
an array variable can be dereferenced by an iterator name from within the
iterator's callback.

Example:

    shader.attributes vec3: 'position'
    shader.vertex (vert) ->
      vert.float 'x', 0
      vert.iterator 3, (iter) ->
        add 'x', vert.attributes.position[iter]

This becomes particularly useful when connecting function calls, because
intermediary storage variables and argument positions are handled
automatically by the DSL.
###
class Jax.Shader.DSL.GlobalDefinitions
  constructor: ->
    @definitions = []
    result = (args...) -> @connect result, args...
    for k, v of this
      result[k] = v
    return result

  reset: ->
    for defn in @definitions
      delete @[defn]
    @definitions.splice 0, @definitions.length

  add: (type, alias, namespace, qualifier = "in") ->
    if match = /\[(.+)\]/.exec alias
      # an array
      capacity = match[1]
      alias = alias.replace /\[(.+)\]/g, ''
    else
      # not an array
      capacity = -1
    @definitions.push alias
    @[alias] =
      capacity: capacity
      type: type
      namespace: namespace
      fullName: "#{namespace}#{alias}"
      qualifier: qualifier
      toString: -> @fullName
    if capacity > 0
      for i in [0...capacity]
        @[alias][i] = "#{namespace}#{alias}[#{i}]"
    @[alias]

  addIndex: (indexName) ->
    for alias in @definitions
      @[alias][indexName] = @[alias].toString() + "[#{indexName}]"
    true
