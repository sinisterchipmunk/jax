class Jax.Shader.Parser
  WHITESPACE = "[\\s\\n\\t]"
  WHOLE_MATCH = 0
  # variables
  SHARED = 1
  VARIABLE_TYPE = 2
  VARIABLE_NAME = 3
  # functions
  PREVIOUS_TOKEN = 1
  FN_SHARED = 3
  RETURN_TYPE = 4
  FUNCTION_NAME = 5
  PARAMS = 6
  BODY_START = 8
  
  parsePrecision = (precision, source) ->
    rx = new RegExp "precision#{WHITESPACE}+(highp|mediump|lowp)#{WHITESPACE}+(\\w+)#{WHITESPACE}*;", "g"
    if match = rx.exec source
      qualifier = match[1]
      type = match[2]
      precision.add
        type: type
        qualifier: qualifier
      parsePrecision precision, source[0...source.indexOf match[0]] +
                                source[(source.indexOf(match[0])+match[0].length)...source.length]
    else
      source

  parseInputs = (variables, source) ->
    qualifier = variables.qualifier
    rx = new RegExp "(shared#{WHITESPACE}+|)#{qualifier}#{WHITESPACE}+(\\w+)((#{WHITESPACE}+[\\w\\[\\]]+,?)+)#{WHITESPACE}*;", "g"
    if match = rx.exec source
      variable_names = (m.trim() for m in match[VARIABLE_NAME].split(','))
      for name in variable_names
        variables.add
          qualifier: qualifier
          type: match[VARIABLE_TYPE]
          shared: !!match[SHARED].trim()
          name: name
      parseInputs variables, source.replace match[0], ''
    else
      source
      
  parseFunctions = (funcs, source) ->
    rx = new RegExp "((^|\\n|;)[\\s\\t\\n]*)(shared#{WHITESPACE}+|)(\\w+)#{WHITESPACE}+(\\w+)#{WHITESPACE}*\\(((.|\n)*?)\\)#{WHITESPACE}*(\\{)", "g"
    if match = rx.exec source
      depth = 0
      pos = source.indexOf(match[WHOLE_MATCH]) + match[WHOLE_MATCH].length
      body = Jax.Util.scan source, '}', '{', '}', pos
      pos += body.length
      funcs.add
        shared: !!match[FN_SHARED]
        type: match[RETURN_TYPE]
        params: match[PARAMS].trim()
        body: body
        name: match[FUNCTION_NAME]
      remainingSource = source.substring(0, source.indexOf(match[WHOLE_MATCH]) + match[PREVIOUS_TOKEN].length) \
                      + source.substring(pos + 1, source.length)
      parseFunctions funcs, remainingSource
    else
      source
      
  parseExports = (exports, source) ->
    rx = /export[\s\t\n]*\([\s\t\n]*(\w+)[\s\t\n]*,[\s\t\n]*(\w+)[\s\t\n]*,[\s\t\n]*/
    if match = rx.exec source
      type = match[1]
      name = match[2]
      expression = Jax.Util.scan source[(source.indexOf(match[0]) + match[0].length)..-1]
      fullMatch = match[0] + expression + ')'
      exp =
        name: name
        type: type
        expression: expression
        mangledName: "exported_#{name}#{exports.length}"
        fullMatch: fullMatch
      exports.push exp
      parseExports exports, source.replace fullMatch, "#{exp.mangledName} = #{exp.expression}"
    else
      source
      
  everything: ->
    everything = []
    everything = everything.concat (obj for obj in @uniforms)
    everything = everything.concat (obj for obj in @attributes)
    everything = everything.concat (obj for obj in @varyings)
    everything = everything.concat (obj for obj in @functions)
    everything

  constructor: (source, @exports = []) ->
    @originalSource = source
    @precision  = new Jax.Shader.Precision
    @uniforms   = new Jax.Shader.Collection 'uniform'
    @attributes = new Jax.Shader.Collection 'attribute'
    @varyings   = new Jax.Shader.Collection 'varying'
    @functions  = new Jax.Shader.FunctionCollection
    source = parseExports @exports, source
    source = parsePrecision @precision, source
    source = parseInputs @uniforms, source
    source = parseInputs @attributes, source
    source = parseInputs @varyings, source
    source = parseFunctions @functions, source
    @global = source.replace(/\n[\s\t]*\n[\s\t]*\n/g, "\n\n").trim().split(/\n/)

  parseCaches: (caches) ->
    rx = /cache[\s\t\n]*\([\s\t\n]*(\w+)[\s\t\n]*,[\s\t\n]*([\w\[\]]+)[\s\t\n]*\)[\s\t\n]*\{/
    for func in @functions.all
      while match = rx.exec(func.body)
        [type, name] = [match[1], match[2]]
        if caches[name] and caches[name] != type
          throw new Error "Can't cache `#{name}` as `#{type}`: already cached it as `#{caches[name]}`"

        block = Jax.Util.scan func.body[(func.body.indexOf(match[0])+match[0].length)..-1], '}', '{', '}'
        caches[name] = type
        @global.push "#{type} #{name};"
        fullMatch = match[0] + block + '}'
        name = name.replace(/[\[\]]/g, '_')
        directive = "\n#ifndef ALREADY_CACHED_#{name}\n#define ALREADY_CACHED_#{name} 1\n#{block}\n#endif"
        func.body = func.body.replace fullMatch, directive
