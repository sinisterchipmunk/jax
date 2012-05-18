class Jax.Shader2.Parser
  WHITESPACE = "[\\s\\n\\t]"
  WHOLE_MATCH = 0
  SHARED = 1
  # variables
  VARIABLE_TYPE = 2
  VARIABLE_NAME = 3
  # functions
  RETURN_TYPE = 2
  FUNCTION_NAME = 3
  PARAMS = 4
  BODY_START = 5
  
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
    rx = new RegExp "(shared#{WHITESPACE}+|)#{qualifier}#{WHITESPACE}+(\\w+)((#{WHITESPACE}+\\w+,?)+)#{WHITESPACE}*;", "g"
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
    rx = new RegExp "(shared#{WHITESPACE}+|)(\\w+)#{WHITESPACE}+(\\w+)#{WHITESPACE}*\\((.*?)\\)#{WHITESPACE}*(\{)", "g"
    if match = rx.exec source
      depth = 0
      pos = source.indexOf(match[WHOLE_MATCH]) + match[WHOLE_MATCH].length
      body = ""
      # to find end of function body, we have to step a character at a time.
      for pos in [pos...source.length]
        if source[pos] == '{' then depth++
        else if source[pos] == '}' then depth--
        if depth == -1 then break
        body += source[pos]
      funcs.add
        shared: !!match[SHARED]
        type: match[RETURN_TYPE]
        params: match[PARAMS].trim()
        body: body
        name: match[FUNCTION_NAME]
      remainingSource = source.substring(0, source.indexOf(match[WHOLE_MATCH])) + source.substring(pos + 1, source.length)
      parseFunctions funcs, remainingSource
    else
      source
      
  everything: ->
    everything = []
    everything = everything.concat (obj for obj in @uniforms)
    everything = everything.concat (obj for obj in @attributes)
    everything = everything.concat (obj for obj in @varyings)
    everything = everything.concat (obj for obj in @functions)
    everything

  constructor: (source) ->
    @originalSource = source
    @precision  = new Jax.Shader2.Precision
    @uniforms   = new Jax.Shader2.Collection 'uniform'
    @attributes = new Jax.Shader2.Collection 'attribute'
    @varyings   = new Jax.Shader2.Collection 'varying'
    @functions  = new Jax.Shader2.Collection
    source = parsePrecision @precision, source
    source = parseInputs @uniforms, source
    source = parseInputs @attributes, source
    source = parseInputs @varyings, source
    source = parseFunctions @functions, source
    @global = source.replace(/\n[\s\t]*\n[\s\t]*\n/g, "\n\n").trim()
