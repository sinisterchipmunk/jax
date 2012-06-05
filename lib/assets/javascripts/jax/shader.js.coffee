#= require_self
#= require "jax/shader/parser"
#= require "jax/shader/collection"
#= require "jax/shader/program"
#= require "jax/shader/precision"
#= require "jax/shader/function_collection"

class Jax.Shader
  processFunctionExports = (body, functions, exports) ->
    for name, exp of exports
      for match in exp.fullMatches
        while body.indexOf(match) != -1
          if functions.isExportUsed exp
            body = body.replace match,
              # ((HAVE_EXPORT_attenuation = true) && (EXPORT_attenuation = 1.0))
              "((HAVE_EXPORT_#{exp.name} = true) ? (EXPORT_#{exp.name} = #{exp.expression}) : (#{exp.expression}))"
          else
            body = body.replace match, exp.expression
    body
    
  processFunctionImports = (body, exports) ->
    rx = new RegExp("import\\(([^,]*?),[\\s\\n\\t]*", "g")
    while match = rx.exec(body)
      start = body.indexOf(match[0])
      name = match[1].trim()
      expression = Jax.Util.scan body[(start+match[0].length)...body.length]
      if exports[name]
        #                (HAVE_EXPORT_attenuation ? EXPORT_attenuation : (1.0))
        gencode = "\n    (HAVE_EXPORT_#{name} ? EXPORT_#{name} : (#{expression.trim()}))"
      else
        gencode = expression
      body = body[0...start] + gencode + body[(start+match[0].length+expression.length+1)...body.length]
    body
  
  mangleVariables = (variables) ->
    lines = for variable in variables.all
      "#{variable.qualifier} #{variable.type} #{variable.mangledName};"
    lines.push "" if lines.length > 0 # empty line for separator
    lines
    
  mangleReferences = (text, collections...) ->
    for collection in collections
      for variable in collection.all
        continue if variable.shared
        rx = new RegExp("([^a-zA-Z\$0-9_]|\\A)#{variable.name}([^a-zA-Z\$0-9_]|\\z)", "g")
        text = text.replace rx, "$1#{variable.mangledName}$2"
    text
  
  mangleFunction = (func, exports) ->
    body = func.body
    body = processFunctionExports body, @functions, exports
    body = processFunctionImports body, exports
    body = mangleReferences body, @uniforms, @attributes, @varyings, @functions
    
    lines = ["#{func.type} #{func.mangledName}(#{func.params}) {"]
    lines = lines.concat body.split /\n/
    lines.push "}"
    lines.push "" if lines.length > 0 # empty line for separator
    lines
    
  merge = (dest, src) ->
    for k, v of src
      dest[k] or= v

  constructor: (@name = "generic") ->
    @precision  = new Jax.Shader.Precision
    @uniforms   = new Jax.Shader.Collection 'uniform'
    @attributes = new Jax.Shader.Collection 'attribute'
    @varyings   = new Jax.Shader.Collection 'varying'
    @functions  = new Jax.Shader.FunctionCollection
    @global = ""
    @main = []
  
  ###
  Appends the GLSL source code to this shader, mangling its non-shared variables
  according to this shader's ID. Warning: this method will alter the structure of
  this shader!
  ###
  append: (source) ->
    parser = new Jax.Shader.Parser source
    result = {}
    @precision.merge parser.precision
    merge result, @uniforms.merge   parser.uniforms
    merge result, @attributes.merge parser.attributes
    merge result, @varyings.merge   parser.varyings
    merge result, @functions.merge  parser.functions
    @global += "\n\n" if @global
    @global += parser.global
    @main.push "#{result.main}();" if result.main
    result
  
  toLines: ->
    lines = []
    lines = lines.concat @precisionLines()
    lines = lines.concat mangleVariables @uniforms
    lines = lines.concat mangleVariables @attributes
    lines = lines.concat mangleVariables @varyings
    lines = lines.concat @global.split /\n/
    exports = @functions.exports
    for name, exp of exports
      if @functions.isExportUsed exp
        lines.push "bool HAVE_EXPORT_#{exp.name} = false;"
        lines.push "#{exp.type} EXPORT_#{exp.name};"
    for func in @functions.all
      lines.push "" if lines.length > 0 # empty line for separator
      lines = lines.concat mangleFunction.call this, func, exports
    unless @functions.main
      lines.push ""
      lines.push "void main(void) {"
      for main in @main
        lines.push "  #{main}"
      lines.push "}"
    lines
    
  precisionLines: ->
    lines = []
    for precision in @precision.all
      lines.push "precision #{precision.qualifier} #{precision.type};"
    lines.push "" if lines.length > 0
    lines
    
  ###
  Converts this shader into its complete, name-mangled source code.
  ###
  toString: ->
    @toLines().join("\n")
