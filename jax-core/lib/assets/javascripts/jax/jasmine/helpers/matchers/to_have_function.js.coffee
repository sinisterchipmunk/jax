beforeEach ->
  @addMatchers
    toHaveFunction: (name) ->
      unless @actual[name] instanceof Function
        @actual = @actual.__proto__.constructor.name || @actual
        return false
      true
