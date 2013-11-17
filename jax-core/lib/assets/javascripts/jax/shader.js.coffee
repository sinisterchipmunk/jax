#= require 'jax/mixins/event_emitter'
#= require_self
#= require_tree './shader'

class Jax.Shader
  @include Jax.Mixins.EventEmitter
  
  @instances: {}

  constructor: (@name = "generic") ->
    @id = Jax.guid()
    @clear()

  clear: ->
    @variables = {}
    @sources = []
    @main = new Array()
    @trigger 'changed'

  processExportsAndImports: (code) ->
    exports = []
    rx = /export[\s\t\n]*\(/
    offset = 0
    exportID = 0
    while match = rx.exec code[offset..-1]
      offsetStart = match.index + offset
      offsetEnd = offsetStart + match[0].length
      remainder = Jax.Util.scan code[offsetEnd..-1]
      offsetEnd += remainder.length + 1
      exp = /^(.*?)[\s\t\n]*,[\s\t\n]*(.*?)[\s\t\n]*,[\s\t\n]*(.*)$/.exec remainder
      exports.push
        fullMatch: code[offsetStart...offsetEnd]
        type: exp[1]
        name: exp[2]
        mangledName: "export_" + exp[2] + exportID++
        value: exp[3]
        offsetStart: offsetStart
        offsetEnd: offsetEnd
      offset = offsetEnd
    
    rx = /import[\s\t\n]*\(/
    for offset in [(code.length-1)..0]
      if match = rx.exec code[offset..-1]
        offsetStart = match.index + offset
        offsetEnd = offsetStart + match[0].length
        remainder = Jax.Util.scan code[offsetEnd..-1]
        offsetEnd += remainder.length + 1
        # consume terminators to prevent empty statements
        offsetEnd++ if code[offsetEnd] == ';'
        imp = /^(.*?)[\s\t\n]*,[\s\t\n]*(.*)$/.exec remainder
        imp =
          fullMatch: code[offsetStart...offsetEnd]
          name: imp[1]
          value: imp[2]
          offsetStart: offsetStart
          offsetEnd: offsetEnd
        replacement = ""
        for exp in exports
          if exp.name == imp.name and exp.offsetStart < imp.offsetStart
            value = imp.value.replace new RegExp(imp.name, 'g'), exp.mangledName
            replacement += value + ";\n"
        code = code.replace imp.fullMatch, replacement

    definitions = ""
    for exp in exports
      definitions += "#{exp.type} #{exp.mangledName};\n"
      expr = exp.mangledName + " = " + exp.value;
      code = code.replace(exp.fullMatch, expr);
    
    if match = /precision.*?\n/.exec code
      ofs = match.index + match[0].length
      code = code[0...ofs] + definitions + code[ofs..-1]
    else
      code = definitions + code
      
    code
    
  toLines: ->
    @toString().split('\n')
    
  toString: ->
    main = new Array()
    main.push line for line in @main
    
    result = ""
    for src, i in @sources
      result += src.mangle result
      result += "\n"
      if mangledMain = src.getMangledMain()
        main.push mangledMain.mangledName + "();"
    body = @processExportsAndImports result + "void main(void) {\n  #{main.join '\n  '}\n}"

    # caches
    caches = {}
    while match = /cache[\s\t\n]*\([\s\t\n]*([^,]+?)[\s\t\n]*,[\s\t\n]*(.*?)[\s\t\n]*\)[\s\t\n]*\{/.exec body
      cacheType = match[1].trim()
      cacheName = match[2].trim()
      offsetStart = match.index
      offsetEnd = offsetStart + match[0].length
      rest = Jax.Util.scan body[offsetEnd..-1], '}', '{'
      offsetEnd += rest.length + 1
      cache = body[offsetStart...offsetEnd]
      cacheCode = ""
      if caches[cacheName]
        if caches[cacheName].type != cacheType
          throw new Error "Cached variable #{cacheName} has a conflicting type: #{cacheType} (already defined as a #{caches[cacheName].type})"
      else
        caches[cacheName] =
          name: cacheName
          type: cacheType
        cacheCode += rest
      body = body[0...offsetStart] + cacheCode + body[offsetEnd..-1]
    definitions = ""
    for name, cache of caches
      definitions += cache.type + " " + cache.name + ";\n"
    if match = /precision.*?\n/.exec body
      ofs = match.index + match[0].length
      body = body[0...ofs] + definitions + body[ofs..-1]
    else
      body = definitions + body

    if body.indexOf('precision') is -1
      "precision mediump float;\nprecision mediump int;\n\n" + body
    else body

  mergeVariables: (parser, map) ->
    for definition in parser.findVariables()
      for name in definition.names
        name = map[name]
        @variables[name] =
          name: name
          qualifier: definition.qualifier
          type: definition.type
    @variables
    
  insert: (src, mangler, index) ->
    @sources.splice index, 0, parser = new Jax.Shader.Parser src, mangler
    map = parser.map()
    @mergeVariables parser, map
    @trigger 'changed'
    map
    
  append: (src, mangler = Jax.guid()) ->
    @insert src, mangler, @sources.length
