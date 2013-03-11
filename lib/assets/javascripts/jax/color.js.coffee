#= require 'jax/core/coffee_patterns'

alphaHex = "0123456789abcdef"

hex2dec = (hex) ->
  n_ = alphaHex.indexOf hex[0...1]
  _n = alphaHex.indexOf hex[1...2]
  (n_ * 16 + _n) / 255

parseHexColor = (hex) ->
  switch hex.length
    when 3
      parseHexColor hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "ff"
    when 4
      parseHexColor hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    when 6
      parseHexColor hex + "ff"
    when 8
      hex = hex.toLowerCase()
      [r, g, b, a] = [hex2dec(hex[0..1]), hex2dec(hex[2..3]),
                      hex2dec(hex[4..5]), hex2dec(hex[6..7])]
      new Jax.Color r, g, b, a
    else throw new Error "Hex color ##{hex} is invalid: must be 3, 4, 6, or 8 characters"

class Jax.Color
  constructor: (r = 1, g = 1, b = 1, a = 1) ->
    @_vec = vec4.clone(arguments)
    @set r, g, b, a
  
  toVec4: -> @_vec
  
  set: (@_red, @_green, @_blue, @_alpha) ->
    [@_vec...] = [@_red, @_green, @_blue, @_alpha]
    
  @define 'red',
    get: -> @_red
    set: (@_red) -> @_vec[0] = @_red
    
  @define 'green',
    get: -> @_green
    set: (@_green) -> @_vec[1] = @_green
    
  @define 'blue',
    get: -> @_blue
    set: (@_blue) -> @_vec[2] = @_blue
    
  @define 'alpha',
    get: -> @_alpha
    set: (@_alpha) -> @_vec[3] = @_alpha
    
  @parse: (value) ->
    if typeof value is 'string' and value[0] == '#'
      parseHexColor value[1..-1]
    else if typeof value is 'string' and (split = value.split(' ')).length != 0
      new Jax.Color (parseFloat(c) for c in split)...
    else if value?.toVec4
      new Jax.Color value.toVec4()...
    else if value?.length
      new Jax.Color value...
    else new Jax.Color Jax.Util.colorize(value)...
