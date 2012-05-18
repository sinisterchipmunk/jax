#= require_self
#= require "jax/shader/parser"
#= require "jax/shader/collection"
#= require "jax/shader/program"
#= require "jax/shader/precision"

class Jax.Shader2
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
  
  mangleFunction = (func) ->
    body = mangleReferences func.body, @uniforms, @attributes, @varyings
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
    @functions  = new Jax.Shader2.Collection
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
    for func in @functions.all
      lines.push "" if lines.length > 0 # empty line for separator
      lines = lines.concat mangleFunction.call this, func
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
