#= require_self
#= require "jax/shader/parser"
#= require "jax/shader/collection"
#= require "jax/shader/program"
#= require "jax/shader/precision"
#= require "jax/shader/function_collection"

class Jax.Shader2
  processFunctionExports = (body, functions, exports) ->
    for name, exp of exports
      if functions.isExportUsed exp
        while body.indexOf(exp.fullMatch) != -1
          body = body.replace(exp.fullMatch, "(EXPORT_#{exp.name} = #{exp.expression})\n#define HAVE_EXPORT_#{exp.name} 1\n")
      else
        body = body.replace(exp.fullMatch, exp.expression) while body.indexOf(exp.fullMatch) != -1
    body
    
  processFunctionImports = (body, exports) ->
    rx = new RegExp("import\\(([^,]*?),[\\s\\n\\t]*", "g")
    while match = rx.exec(body)
      start = body.indexOf(match[0])
      name = match[1].trim()
      expression = Jax.Util.scan body[(start+match[0].length)...body.length]
      if exports[name]
        gencode = "\n    #ifdef HAVE_EXPORT_#{name}\n      EXPORT_#{name}\n    #else\n      #{expression.trim()}\n    #endif\n  "
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
    body = mangleReferences func.body, @uniforms, @attributes, @varyings
    body = processFunctionExports body, @functions, exports
    body = processFunctionImports body, exports
    
    lines = ["#{func.type} #{func.mangledName}(#{func.params}) {"]
    lines = lines.concat body.split /\n/
    lines.push "}"
    lines.push "" if lines.length > 0 # empty line for separator
    lines
    
  merge = (dest, src) ->
    for k, v of src
      dest[k] or= v

  constructor: (@type, @name = "generic") ->
    @precision  = new Jax.Shader2.Precision
    @uniforms   = new Jax.Shader2.Collection 'uniform'
    @attributes = new Jax.Shader2.Collection 'attribute'
    @varyings   = new Jax.Shader2.Collection 'varying'
    @functions  = new Jax.Shader2.FunctionCollection
    @global = ""
    @main = []
  
  ###
  Appends the GLSL source code to this shader, mangling its non-shared variables
  according to this shader's ID.
  ###
  append: (source) ->
    parser = new Jax.Shader2.Parser source
    result = {}
    @precision.merge parser.precision
    merge result, @uniforms.merge   parser.uniforms
    merge result, @attributes.merge parser.attributes
    merge result, @varyings.merge   parser.varyings
    merge result, @functions.merge  parser.functions
    @global += "\n\n" if @global
    @global += parser.global
    @main.push result.main if result.main
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
      lines.push "#{exp.type} EXPORT_#{exp.name};" if @functions.isExportUsed exp
    for func in @functions.all
      lines.push "" if lines.length > 0 # empty line for separator
      lines = lines.concat mangleFunction.call this, func, exports
    unless @functions.main
      lines.push ""
      lines.push "void main(void) {"
      for main in @main
        lines.push "  #{main}();"
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
