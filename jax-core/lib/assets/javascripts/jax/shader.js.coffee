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
    @sources = []
    @main = new Array()
    @trigger 'changed'

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
    body = result + "void main(void) {\n  #{main.join '\n  '}\n}"

    definitions = ""
    if match = /precision.*?\n/.exec body
      ofs = match.index + match[0].length
      body = body[0...ofs] + definitions + body[ofs..-1]
    else
      body = definitions + body

    if body.indexOf('precision') is -1
      "precision mediump float;\nprecision mediump int;\n\n" + body
    else body

  insert: (src, mangler, index) ->
    @sources.splice index, 0, parser = new Jax.Shader.Parser src, mangler
    @trigger 'changed'
    
  append: (src, mangler = Jax.guid()) ->
    @insert src, mangler, @sources.length
