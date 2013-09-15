class Variable
  constructor: ->
    @names = []
    @shared = false
    @qualifier = null
    @type = null

class Jax.Shader.Parser
  findVariables: ->
    # Need a state machine instead of simple regexp
    variables = []
    src = @src
    STATE_NONE = 0
    STATE_SHARED = 1
    STATE_QUALIFIED = 2
    STATE_TYPED = 4
    STATE_COMMENT_SINGLE = 8
    STATE_COMMENT_MULTI  = 16

    state = STATE_NONE

    token = ''
    variable = new Variable()
    matching = []
    match = { 0: '', offset: 0 }
    processToken = (token) ->
      return if token is ''
      if state is STATE_NONE
        # token could be 'shared', a qualifier, or unimportant
        switch token
          when 'shared'
            state |= STATE_SHARED
            variable.shared = true
          when 'varying', 'uniform', 'attribute'
            state |= STATE_QUALIFIED
            variable.qualifier = token
      else if state & STATE_TYPED
        # token is a variable name
        variable.names or= []
        variable.names.push token.replace(/,/, '')
      else if state & STATE_QUALIFIED
        # token must be a type
        state |= STATE_TYPED
        variable.type = token
      else if state & STATE_SHARED
        # token could be a qualifier, or unimportant
        switch token
          when 'varying', 'uniform', 'attribute'
            state |= STATE_QUALIFIED
            variable.qualifier = token
          else
            # it's not a shared variable, but might be a shared function
            # we'll handle functions elsewhere
            state = STATE_NONE
            # throw new Error "Unexpected token: #{token}, expected one of 'varying', 'uniform', 'attributes'. State is: #{state}"
      else throw new Error "Unexpected state: #{state}"

    for ch, offset in src
      match[0] += ch
      # handle comment characters
      if ch is '\n' and state & STATE_COMMENT_SINGLE
        state ^= STATE_COMMENT_SINGLE
        continue
      if match[0].length >= 2 and match[0].indexOf('*/') == match[0].length - 2 and state & STATE_COMMENT_MULTI
        state ^= STATE_COMMENT_MULTI
        continue
      continue if state & STATE_COMMENT_SINGLE or state & STATE_COMMENT_MULTI
      if match[0].length >= 2 and match[0].indexOf('//') == match[0].length - 2
        # remove comment characters from token
        token = token.replace(/\/$/, '')
        state |= STATE_COMMENT_SINGLE
        continue
      if match[0].length >= 2 and match[0].indexOf('/*') == match[0].length - 2
        # remove comment characters from token
        token = token.replace(/\/$/, '')
        state |= STATE_COMMENT_MULTI
        continue
      # handle non-comment characters
      if ch is ';'
        processToken token
        if state & STATE_TYPED
          # vari.match = match for vari in matching
          variable.match = match
          variables.push variable
          variable = new Variable()
        state = STATE_NONE
        match = { 0: '', offset: offset }
        token = ''
      else if ch is '\n' or ch is ' ' or ch is '\t'
        processToken token
        if state is STATE_NONE
          match = { 0: '', offset: offset }
        token = ''
      else
        token += ch
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

