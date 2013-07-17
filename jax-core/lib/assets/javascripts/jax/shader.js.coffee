#= require_self
#= require_tree './shader'

class Parser
  findVariables: ->
    variables = []
    rx = /(shared[\s\t\n]+|)(varying|uniform|attribute)[\s\t\n]+(\w+)[\s\t\n]+(((\w+)([\s\t\n]*,[\s\t\n]*|))+)[\s\t\n]*;/
    src = @src
    while match = rx.exec src
      offsetStart = match.index
      offsetEnd = match.index + match[0].length
      variables.push
        shared: !!match[1]
        qualifier: match[2]
        type: match[3]
        names: match[4].split(/, ?/)
        match: match
      src = src[0...offsetStart] + src[offsetEnd..-1]
    variables
    
  findFunctions: ->
    functions = []
    rx = /(shared[\s\t\n]+|)(\w+)[\s\t\n]+(\w+)[\s\t\n]*\([\s\t\n]*[\s\t\n]*(.*?)[\s\t\n]*\)[\s\t\n]*{/
    src = @src
    while match = rx.exec src
      offsetStart = match.index
      offsetEnd = match.index + match[0].length
      signature = match[4]
      offsetEnd += Jax.Util.scan(src[offsetEnd..-1], '}', '{').length + 1
      func = src[offsetStart...offsetEnd]
      src = src[0...offsetStart] + src[offsetEnd..-1]
      functions.push
        shared: !!match[1]
        signature: signature
        full: func
        type: match[2]
        name: match[3]
    functions
  
  constructor: (@src, @mangler) ->
    
  getMangledMain: () ->
    mangles = @findFunctions()
    for mangle in mangles
      if mangle.name == 'main'
        mangle.mangledName = mangle.name + @mangler
        return mangle
    null
    
  map: () ->
    map = {}
    mangles = @findVariables()
    for mangle in mangles
      for name in mangle.names
        if mangle.shared
          map[name] = name
        else
          map[name] = name + @mangler
    map
    
  mangle: (currentSrc) ->
    src = @src
    # variables
    mangles = @findVariables()
    for mangle in mangles
      mangledNames = []
      for name in mangle.names
        if mangle.shared
          continue if new RegExp("#{name}(,|;)").test currentSrc
          mangledNames.push name
        else
          mangledNames.push name + @mangler
      if mangledNames.length > 0
        mangledNames = mangledNames.join ', '
        variable = [mangle.qualifier, mangle.type, mangledNames].join ' '
        variable += ';'
      else
        variable = ""

      src = src.replace mangle.match[0], variable
      # references
      continue if mangle.shared
      for name in mangle.names
        mangledName = name + @mangler
        while match = new RegExp("(^|\\W)#{name}(\\W|$)").exec src
          src = src.replace match[0], match[1] + mangledName + match[2]
          
    # functions
    mangles = @findFunctions()
    for mangle in mangles
      if mangle.shared
        mangledName = mangle.name
      else
        mangledName = mangle.name + @mangler
      mangledSignature = mangle.signature.replace mangle.name, mangledName
      mangledFunc = mangle.full.replace mangle.signature, mangledSignature
      mangledFunc = mangledFunc.replace /shared[\s\t\n]+/, ''
      src = src.replace mangle.full, mangledFunc
      continue if mangle.shared
      while match = new RegExp("(^|\\W)#{mangle.name}(\\W|$)").exec src
        src = src.replace match[0], match[1] + mangledName + match[2]
    
    src

class Jax.Shader
  @include Jax.EventEmitter
  
  constructor: (@name = "generic") ->
    @id = Jax.guid()
    @variables = {}
    @sources = []
    @main = new Array()
    
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
      "precision mediump float;\n\n" + body
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
    @sources.splice index, 0, parser = new Parser src, mangler
    map = parser.map()
    @mergeVariables parser, map
    @fireEvent 'changed'
    map
    
  append: (src, mangler = Jax.guid()) ->
    @insert src, mangler, @sources.length
