merge = (dest, src) ->
  for k, v of src
    dest[k] = v
    
class Jax.Shader2.CompileError extends Jax.Error
  constructor: (message) ->
    super()
    @message = message

class Jax.Shader2.Program
  buildBacktrace = (gl, shader, source) ->
    log = gl.getShaderInfoLog(shader).split /\n/
    rx = /\d+:(\d+):(.*)/
    errors = (rx.exec line for line in log)
    for index in [0...source.length]
      line = source[index]
      humanLineNo = index+1
      if humanLineNo < 10 then humanLineNo = "  #{humanLineNo}" else if humanLineNo < 100 then humanLineNo = " #{humanLineNo}"
      log.push "#{humanLineNo} : #{line}"
      for errno in [0...errors.length]
        if errors[errno] and parseInt(errors[errno][1]) == index+1
          log.push "   :: ERROR : #{errors[errno][2]}"
          errors.splice errno-1, 1
          errno = 0
    log

  compileShader = (gl, jaxShader, glShader) ->
    gl.shaderSource glShader, jaxShader.toString()
    gl.compileShader glShader
    unless gl.getShaderParameter glShader, GL_COMPILE_STATUS
      backtrace = buildBacktrace gl, glShader, jaxShader.toLines()
      throw new Jax.Shader2.CompileError "Shader #{jaxShader.name} failed to compile\n\n#{backtrace.join("\n")}"
    
  
  constructor: (@gl) ->
    @_program = @gl.createProgram()
    @_vshader = @gl.createShader GL_VERTEX_SHADER
    @_fshader = @gl.createShader GL_FRAGMENT_SHADER
    @gl.attachShader @_program, @_vshader
    @gl.attachShader @_program, @_fshader

    @shaders = []
    @vertex = new Jax.Shader2
    @fragment = new Jax.Shader2
    
  compile: ->
    compileShader @gl, @vertex, @_vshader
    compileShader @gl, @fragment, @_fshader
    @gl.linkProgram @_program
    unless @gl.getProgramParameter @_program, GL_LINK_STATUS
      throw new Error "Could not initialize shader!\n\n"+ @gl.getProgramInfoLog @_program
    @_compiled = true
    
  bind: ->
    @compile() unless @_compiled
    @gl.useProgram @_program
  