class Jax.Shader.Collection
  constructor: (@qualifier) ->
    @_variables = []
    @length = 0
  
  add: (obj) ->
    if obj.shared
      obj.mangledName = obj.name
    else
      obj.mangledName = "#{obj.name}#{@count obj.name}"
    for other in @_variables
      if obj.mangledName == other.mangledName
        if obj.shared and other.shared
          return other
        else
          throw new Error "BUG: Shader variable redefinition: #{obj.name} (#{JSON.stringify other} => #{JSON.stringify obj})"
    @_variables.push obj
    @length++
    Object.defineProperty this, obj.mangledName,
      configurable: true
      get: => obj
    obj
    
  # Remove the named property and return it.
  remove: (name) ->
    obj = @[name]
    @_variables.splice @_variables.indexOf(obj), 1
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
