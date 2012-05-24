class Jax.Shader.FunctionCollection extends Jax.Shader.Collection
  detectExports = (code, exports = {}) ->
    # export(type, name, expression)
    if match = /export[\t\s\n]*\(/.exec(code)
      fullMatch = match[0]
      start = code.indexOf match[0]
      paramStart = start + match[0].length
      params = Jax.Util.scan code[paramStart...code.length]
      paramEnd = paramStart + params.length
      end = paramEnd + 1
      
      match = /([^,]*?),([^,]*?),(.*)/m.exec params
      if match is null then throw new Error "Export requires 3 arguments: type, name and expression"
      [type, name, expression] = [match[1].trim(), match[2].trim(), match[3].trim()]
      exports[name] =
        start: start
        end: end
        paramStart: paramStart
        paramEnd: paramEnd
        type: type
        name: name
        expression: expression
        params: params
        fullMatch: fullMatch + match[0] + ')'
      
      replacement = ""
      replacement = replacement + " " for i in [start...end]
      code = code[0...start] + replacement + code[end...code.length]
      detectExports code, exports
    else
      exports
      
  isExportUsed: (exp) ->
    for func in @all
      if new RegExp("import\\(#{exp.name}", "g").test func.body
        return true
    false
  
  @define 'exports'
    get: ->
      exports = {}
      for func in @all
        funcExports = detectExports func.body
        for name, exp of funcExports
          exports[name] = exp
      exports
      