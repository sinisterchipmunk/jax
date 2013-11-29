class Jax.Color.Group
  constructor: (names...) ->
    @names = names
    for name in names
      do (name) =>
        color = new Jax.Color
        Object.defineProperty @, name,
          get: -> color
          set: (newColor) -> color.parse newColor
          enumerable: true

  setAll: (value) ->
    # handle case where value is an object of nested values; this also handles
    # assignment to another color group
    if typeof value is 'object'
      assigned = false
      for name in @names
        if value[name]
          @[name] = value[name]
          assigned = true
      return value if assigned
    # handle case where value is any representation of a color
    value = Jax.Color.parse value
    for name in @names
      @[name] = value
    value
