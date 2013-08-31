beforeEach ->
  jasmine.Clock.useMock()
  # force jax to use timeouts, so we can use jasmine mocks to test it
  Jax.useRequestAnimFrame = false

  @addMatchers 
    toBeEnabled: ->
      return true if @actual.enabled
      return false if @actual.disabled
      return true if @actual.prop and not @actual.prop("disabled")
      return true if @actual.prop and     @actual.prop("enabled")
      false

    toBeReady: ->
      return @actual.isReady()

    toBeDisabled: ->
      return false if @actual.enabled
      return true if @actual.disabled
      return false if @actual.prop and not @actual.prop("disabled")
      return false if @actual.prop and     @actual.prop("enabled")
      true

    toHaveBeenCalledWithInstanceOf: (klass) ->
      return false unless @actual.wasCalled
      for call in @actual.calls
        if call.args.length and call.args[0] instanceof klass
          return true
      instances = []
      for call in @actual.calls
        args = (arg.__proto__.constructor.name for arg in call.args)
        instances.push "[#{args.join(', ')}]"
      instances = instances[0] if instances.length is 1
      instances = "[#{instances.join ', '}]" if instances.join
      @message = =>
        "Expected #{if @isNot then 'not ' else ' '} to be called with an instance of #{klass.name}; was called with #{instances}"
      false

    toBeCounterClockwise: (xform) -> !@actual.isClockwise xform

    toBeClockwise: (xform) -> @actual.isClockwise xform

    toBeNaN: -> isNaN @actual

    toHaveBeenCalledWithIsh: (ish) ->
      for call in @actual.calls
        return true if Math.equalish call.args, ish
      false

    toBeDisposed: -> @actual.isDisposed()

    toBeRendering: -> @actual.isRendering()

    toBeUpdating: -> @actual.isUpdating()

    toBeValid: (context = null) -> @actual.isValid context

    toInclude: (obj) -> @actual.indexOf(obj) isnt -1
    
    toIncludeSubset: (subset) ->
      for i in [0...@actual.length]
        found = true
        for j in [0...subset.length]
          found = false if @actual[i+j] != subset[j]
        return true if found
      false

    toIncludishSubset: (subset) ->
      unless @actual.length
        throw new Error("Use #toIncludishSubset with arrays and vectors, not scalars");

      for i in [0...@actual.length]
        found = true
        for j in [0...subset.length]
          found = false unless Math.equalish @actual[i+j], subset[j]
        return true if found
      false

    toBeBlank: -> @actual && @actual.toString().length is 0

    toBeKindOf: -> throw new Error "#toBeKindOf() is deprecated; please use #toBeInstanceOf() instead."

    toBeInstanceOf: (expectedKlass) -> @actual instanceof expectedKlass

    toBeTrue: -> @actual is true

    toBeFalse: -> @actual is false

    toBeUndefined: -> @actual is undefined

    toBeAFunction: -> typeof(@actual) is 'function'
    toBeAMethod: -> typeof(@actual) is 'function'

    toHaveFunction: (name) -> typeof(@actual[name]) is 'function'
    toHaveMethod: (name) -> typeof(@actual[name]) is 'function'

    toEqualVector: ->
      switch arguments.length
        when 1 then vec = arguments[0]
        when 3 then vec = arguments
        else throw new Error "Invalid args"
      switch vec.length
        when  2 then  vec2.equalish @actual, vec
        when  3 then  vec3.equalish @actual, vec
        when  4 then  vec4.equalish @actual, vec
        when  6 then mat2d.equalish @actual, vec
        when  9 then  mat3.equalish @actual, vec
        when 16 then  mat4.equalish @actual, vec
        else
          return false unless @actual.length is vec.length
          for i in [0...@actual.length]
            return false unless Math.equalish @actual[i], vec[i]
          true

    toEqualMatrix: (mat) ->
      Math.equalish @actual, mat

    toHaveFace: (v1, v2, v3) ->
      for face in @actual.faces
        f = actual.getFaceVertices face
        match = true
        for j in [0..2]
          for k in [0..2]
            if Math.equalish f[j][k], arguments[j][k]
              match = false
        return true if match
      false

    toHaveEdge: (v1, v2) ->
      for face in @actual.edges
        e = actual.getEdgeVertices edge
        match = true
        for j in [0..1]
          for k in [0..2]
            if Math.equalish f[j][k], arguments[j][k]
              match = false
        return true if match
      false

    toBeEmpty: ->
      try
        @actual.length is 0
      catch e
        # sometimes on firefox???
        throw new Error "Expected actual to have a length; got #{JSON.stringify @actual}"

    toBeRendered: ->
      @context.world.addObject model
      spyOn @model, 'render'
      @context.world.render()
      @model.render.calls.length
    
    toDefaultToMaterial: (name, world) ->
      if name instanceof Jax.Material then matr = name
      else matr = Jax.Material.find name
      spyOn matr, 'render'
      world.render()
      matr.render.calls.length
