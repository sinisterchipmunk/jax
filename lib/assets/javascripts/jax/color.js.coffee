#= require 'jax/core/coffee_patterns'

alphaHex = "0123456789abcdef"

hex2dec = (hex) ->
  n_ = alphaHex.indexOf hex[0...1]
  _n = alphaHex.indexOf hex[1...2]
  (n_ * 16 + _n) / 255

parseHexColor = (hex, color) ->
  switch hex.length
    when 3
      parseHexColor hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "ff", color
    when 4
      parseHexColor hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3], color
    when 6
      parseHexColor hex + "ff", color
    when 8
      hex = hex.toLowerCase()
      [r, g, b, a] = [hex2dec(hex[0..1]), hex2dec(hex[2..3]),
                      hex2dec(hex[4..5]), hex2dec(hex[6..7])]
      color.set r, g, b, a
    else throw new Error "Hex color ##{hex} is invalid: must be 3, 4, 6, or 8 characters"

hexEncode = (flt, precision) ->
  dec = parseInt flt * 255
  result = switch precision
    when 1 then parseInt(dec / 16).toString(16)
    when 2
      result = dec.toString(16)
      if result.length == 1 then "0#{result}"
      else result
    else throw new Error "invalid precision"

class Jax.Color
  @include Jax.EventEmitter

  constructor: (r = 1, g = 1, b = 1, a = 1) ->
    @_vec = vec4.clone(arguments)
    @set r, g, b, a
  
  toVec4: -> @_vec

  toString: (channels = 8) ->
    switch channels
      when 3
        "##{hexEncode @red, 1}#{hexEncode @green, 1}#{hexEncode @blue, 1}"
      when 4
        "##{hexEncode @red, 1}#{hexEncode @green, 1}#{hexEncode @blue, 1}#{hexEncode @alpha, 1}"
      when 6
        "##{hexEncode @red, 2}#{hexEncode @green, 2}#{hexEncode @blue, 2}"
      when 8
        "##{hexEncode @red, 2}#{hexEncode @green, 2}#{hexEncode @blue, 2}#{hexEncode @alpha, 2}"
      else throw new Error "Channels must be 3, 4, 6, or 8"

  set: (@_red, @_green, @_blue, @_alpha) ->
    [@_vec...] = [@_red, @_green, @_blue, @_alpha]
    @trigger 'change'
    this
    
  @define 'red',
    get: -> @_red
    set: (@_red) ->
      @_vec[0] = @_red
      @trigger 'change'
    
  @define 'green',
    get: -> @_green
    set: (@_green) ->
      @_vec[1] = @_green
      @trigger 'change'
    
  @define 'blue',
    get: -> @_blue
    set: (@_blue) ->
      @_vec[2] = @_blue
      @trigger 'change'
    
  @define 'alpha',
    get: -> @_alpha
    set: (@_alpha) ->
      @_vec[3] = @_alpha
      @trigger 'change'

  parse: (value) ->
    if typeof value is 'string' and value[0] == '#'
      parseHexColor value[1..-1], this
    else if typeof value is 'string' and (split = value.split(' ')).length != 0
      @set (parseFloat(c) for c in split)...
    else if value?.toVec4
      @set value.toVec4()...
    else if value?.length
      @set value...
    else @set Jax.Util.colorize(value)...
    
  @parse: (value) ->
    new Jax.Color().parse value
