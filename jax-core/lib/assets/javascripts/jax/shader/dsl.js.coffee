class Jax.Shader.DSL
  @include Jax.Mixins.EventEmitter

  indent = (str) ->
    str = if str.toSource then str.toSource() else str.toString()
    "  "+str.replace(/\n/g, "\n  ")

  @builders:
    code: (code) -> code

    connect: (data) ->
      {fn, map} = data
      args = []
      lines = []
      lparam = ''
      for definition in fn.definitions
        storage = "#{fn.fnName}_#{definition}#{Jax.guid()}"
        if map?[definition]
          if fn[definition].qualifier is 'in'
            args.push map[definition].toString()
          else
            if definition is 'result'
              lparam = "#{map[definition]} = "
              continue
            if fn[definition].qualifier is 'inout'
              lines.push "#{fn[definition].type} #{storage} = #{map[definition]};"
            else
              lines.push "#{fn[definition].type} #{storage};"
            fn[definition].fullName = storage
            args.push storage
        else
          if fn[definition].qualifier is 'in' or fn[definition].qualifier is 'inout'
            throw new Error "Input argument #{definition} must be satisfied"
          if definition is 'result'
            lparam = "#{fn.returnType} #{storage} = "
          else
            lines.push "#{fn[definition].type} #{storage};"
          fn[definition].fullName = storage
          args.push storage
      left = "#{lparam}#{fn.fnName}("
      lines.push "#{left}#{args.join ",\n#{left.replace /./g, ' '}"});"
      lines.join "\n"

    iterator: (data) ->
      {toward, dsl} = data
      [
        "for (int #{dsl.name} = 0; #{dsl.name} < #{toward}; #{dsl.name}++) {"
          indent(dsl)
        "}"
      ].join "\n"

    average: (args) ->
      lparam = args[0]
      args = args[1..-1]
      throw new Error "Not enough args" unless args.length
      if args.length is 1
        "#{lparam} = #{@floatify args[0]};"
      else
        one_over_n = @floatify 1.0 / args.length
        args = (@floatify arg for arg in args)
        "#{lparam} = (#{args.join ' + '}) * #{one_over_n};"

    arithmetic: (command) ->
      {operand, args} = command
      switch args.length
        when 2 then "#{args[0]} #{operand}= #{args[1]};"
        when 3 then "#{args[0]} = #{args[1]} #{operand} #{args[2]};"
        else throw new Error "expected 2 or 3 arguments, got #{args.length}"

    set: (args) ->
      "#{args[0]} = #{@floatify args[1]};"

    uniforms: (command) -> @builders.define.call this, 'uniform', command
    varyings: (command) -> @builders.define.call this, 'varying', command

    define: (qualifier, command) ->
      definitions = for type, fields of command
        fields = @namespace fields, qualifier.charAt(0).toUpperCase()+"_"
        left = "#{qualifier} #{type}"
        "#{left} #{fields.join ",\n #{left.replace /./g, ' '}"};"
      scope: 'top'
      fragment: definitions.join "\n"

  constructor: (options) ->
    @builders or= $.extend {}, Jax.Shader.DSL.builders
    @commands = []
    @functions = []
    @hasMain = true
    for k, v of options
      @[k] = v
    true

  iterate: (toward, callback) ->
    iterator = new Jax.Shader.DSL
      hasMain: false
      name: "iter#{Jax.guid()}"
      toString: -> @name
    for collection in @functions
      iterator.functions.push collection
      iterator[collection.fnName] = collection
    @command 'iterator', toward: toward, dsl: iterator
    if callback
      @uniforms.addIndex iterator.name
      @varyings.addIndex iterator.name
      @attributes?.addIndex iterator.name
      callback iterator, iterator.name
    iterator

  reset: ->
    delete fn.name for fn in @functions
    @functions.splice 0, @functions.length
    @commands.splice 0, @commands.length

  ###
  Connects the outputs from one function to the inputs of another, or connects
  variable values to inputs and outputs.

  Example:

      # assume a function with the signature
      # `void calculateLighting(in int lightType, inout vec4 color)`
      shader.connect shader.calculateLighting,
        lightType: shader.uniforms.LightType
        color: 'gl_FragColor'

  The above example will produce shader code that uses the uniform `LightType`
  for the input argument, and the current value of `gl_FragColor` for the
  `color` argument, which will be used by the function as both input and
  output (this is typical of additive lighting passes).

  This method _must_ satisfy all of the inputs of the specified function. If
  any input does not receive a value, an error will be raised.
  ###
  connect: (func, mapping) ->
    @command 'connect',
      fn: func
      map: mapping

  # returns a float no larger than 6 decimal places (javascript supports more
  # decimal places than glsl) and also removes trailing 0's for aesthetics.
  # If the input is NaN (text, special values, etc), it is returned unchanged.
  floatify: (n) ->
    if isNaN n then n
    else n.toFixed(6).replace /\.(\d+?)0+$/, '.$1'

  command: (name, data, insertAt = @commands.length) ->
    @commands.splice insertAt, 0, [ name, data ]
    @trigger 'change'

  addVaryings: (varyings) ->
    @addDefinition @varyings, varyings, "V_"
    @command 'varyings', varyings

  addUniforms: (uniforms) ->
    @addDefinition @uniforms, uniforms, "U_"
    @command 'uniforms', uniforms

  addDefinition: (collection, definitions, namespace, qualifier) ->
    for type, fields of definitions
      if fields.join
        for field in fields
          collection.add type, field, namespace, qualifier
      else
        collection.add type, fields, namespace, qualifier
    true

  ###
  Adds raw source code to the shader. If the scope is `'top'`, it is added
  to the top-level scope. If it is `'main'`, it is added to the body of the
  `main` function. You can also omit the scope and pass only a single string
  argument, in which case the scope defaults to `main`.
  ###
  code: (scope, code) ->
    if code is undefined
      code = scope
      scope = 'main'
    if scope is 'top'
      parser = new Jax.Shader.Parser code, ""
      @parseFunctionDefinitions parser
      @parseVariableDefinitions parser
    @command 'code',
      scope: scope
      fragment: code

  ###
  Compatibility for legacy code. Same as `code`.
  ###
  append: (code) -> @code 'top', code

  ###
  Parses function definitions from the given code fragment and defines
  corresponding variable collections for each function found. This enables
  the `connect` syntax.
  ###
  parseFunctionDefinitions: (parser) ->
    funcs = parser.findFunctions()
    for func in funcs
      collection = new Jax.Shader.DSL.GlobalDefinitions
      collection.fnName = func.name
      collection.returnType = func.type
      @hasMain = false if func.name is 'main'
      for arg in func.args
        arg.qualifier or= "in"
        arg = collection.add arg.type, arg.name, "", arg.qualifier
        arg.func = func
      if func.type isnt 'void'
        collection.add func.type, 'result', '', 'out'
      @functions.push collection
      @[func.name] = collection
    funcs

  parseVariableDefinitions: (parser) ->
    variableSets = parser.findVariables()
    uniforms = {}
    varyings = {}
    attributes = {}
    for variableSet in variableSets
      switch variableSet.qualifier
        when 'varying'   then varyings[variableSet.type]   = variableSet.names
        when 'uniform'   then uniforms[variableSet.type]   = variableSet.names
        when 'attribute' then attributes[variableSet.type] = variableSet.names
        else throw new Error "BUG: unexpected qualifier: #{variableSet.qualifier}"
    @addDefinition @varyings,   varyings,   '', 'varying'
    @addDefinition @attributes, attributes, '', 'attribute'
    @addDefinition @uniforms,   uniforms,   '', 'uniform'
    variableSets

  arithmetic: (operand, args...) ->
    @command 'arithmetic', operand: operand, args: args

  average:  (args...) -> @command 'average', args
  add:      (args...) -> @arithmetic '+', args...
  subtract: (args...) -> @arithmetic '-', args...
  multiply: (args...) -> @arithmetic '*', args...
  divide:   (args...) -> @arithmetic '/', args...
  set: (a, b) -> @command 'set', [a, b]

  namespace: (fields, ns) ->
    fields = [ fields ] if typeof fields is 'string'
    "#{ns}#{field}" for field in fields

  toString: (info) -> @toSource info

  processTemplate: (template, info) ->
    if typeof template is 'string' then template
    else template info

  toSource: (info) ->
    [top, main] = [[], []]
    for [type, command] in @commands
      if @builders[type]
        result = @builders[type].call this, command
        if typeof result is 'string' then main.push @processTemplate result, info
        else
          if result.scope == 'main' then main.push @processTemplate result.fragment, info
          else top.push @processTemplate result.fragment, info
      else
        throw new Error "Builder not found: #{type}"
    if @hasMain
      main = [ "void main() {", indent(main.join("\n")), "}" ]
    parts = [ top.join("\n"), main... ]
    code = parts.join("\n")
    @addDefaultPrecision code

  # Adds default precision specifiers if none are found in the given code.
  addDefaultPrecision: (code) ->
    return code if code.indexOf('precision ') isnt -1
    "precision mediump float;\nprecision mediump int;\n#{code}"
