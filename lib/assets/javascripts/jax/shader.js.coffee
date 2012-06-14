#= require_self
#= require "jax/shader/parser"
#= require "jax/shader/collection"
#= require "jax/shader/program"
#= require "jax/shader/precision"
#= require "jax/shader/function_collection"

class Jax.Shader
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
    
  processImports = (body, exports) ->
    rx = /import[\s\t\n]*\([\s\t\n]*(\w+)[\s\t\n]*,[\s\t\n]*(.*?)[\s\t\n]*\)[\s\t\n]*;/
    if match = rx.exec body
      name = match[1]
      expression = match[2]
      code = ""
      for exp in exports
        if name == exp.name
          code += expression.replace(new RegExp("(^|[^a-zA-Z0-9_])#{name}([^a-zA-Z0-9_]|$)", 'g'), \
                                     "$1#{exp.mangledName}$2")
          code += ";"
      body = body[0...body.indexOf match[0]] + code + body[(body.indexOf(match[0]) + match[0].length)..-1]
      body = processImports body, exports
    body
  
  mangleFunction = (func, exports) ->
    body = func.body
    body = mangleReferences body, @uniforms, @attributes, @varyings, @functions
    body = processImports body, exports
    
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
    @exports = []
    @caches = {}
    @global = []
    @main = []
  
  ###
  Appends the GLSL source code to this shader, mangling its non-shared variables
  according to this shader's ID. Warning: this method will alter the structure of
  this shader!
  ###
  append: (source) ->
    parser = new Jax.Shader.Parser source, @exports
    parser.parseCaches @caches
    result = {}
    @precision.merge parser.precision
    merge result, @uniforms.merge   parser.uniforms
    merge result, @attributes.merge parser.attributes
    merge result, @varyings.merge   parser.varyings
    merge result, @functions.merge  parser.functions
    (@global.push line unless @global.indexOf(line) != -1) for line in parser.global
    @main.push "#{result.main}();" if result.main
    
    result
    
  exportDeclarations: ->
    for exp in @exports
      "#{exp.type} #{exp.mangledName};"
  
  toLines: ->
    lines = []
    lines = lines.concat @precisionLines()
    lines = lines.concat @global
    lines = lines.concat @exportDeclarations()
    lines = lines.concat mangleVariables @uniforms
    lines = lines.concat mangleVariables @attributes
    lines = lines.concat mangleVariables @varyings
    for func in @functions.all
      lines.push "" if lines.length > 0 # empty line for separator
      lines = lines.concat mangleFunction.call this, func, @exports
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
