class Jax.Shader2.Collection
  constructor: (@qualifier) ->
    @_variables = []
    @length = 0
  
  add: (obj) ->
    if obj.shared
      obj.mangledName = obj.name
    else
      obj.mangledName = "#{obj.name}#{@count obj.name}"
    @_variables.push obj
    @length++
    Object.defineProperty this, obj.mangledName, get: => obj
    obj
    
  count: (name) ->
    count = 0
    for obj in @_variables
      count++ if obj.name == name
    count
    
  @define 'all', get: -> @_variables
    
  ###
  Merges `other` into `this` so that `this` contains the union of both variables.
  If `prefix` is given, it is prepended to the name of each variable prior to merge.
  
  Returns a mapping of `{name: mangledName}`
  ###
  merge: (other) ->
    result = {}
    for descriptor in other.all
      result[descriptor.name] = @add(descriptor).mangledName
    result
