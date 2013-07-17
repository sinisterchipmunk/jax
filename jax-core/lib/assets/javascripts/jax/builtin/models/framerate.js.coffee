###

A visual frames per second counter that can be added to the world like any 
other model:

    @world.addObject new Jax.Framerate

Several options can be passed:

    width  - the width in pixels, defaults to 128
    height - the height in pixels, defaults to 64
    font   - the font, defaults to "10pt Arial"
    ema    - a number, or false (see below), defaults to 30
    left   - the left pixel coordinate of the counter
    top    - the top pixel coordinate of the counter

After instantiation, the counter can be manipulated just like any other Jax 
model (e.g. `new Jax.Framerate().camera.getPosition()`) except that it uses 
pixel coordinates instead of world units and is displayed with an 
orthographic (essentially 2D) projection.

The framerate is capable of two modes of operation:

* EMA - calculates an exponential moving average of the framerate based on 
  the `ema` option, producing a smooth line on the graph, allowing you to 
  visually "skip over" temporary disruptions such as garbage collection, and 
  giving you the "big picture".
* Instant - if the `ema` option is `false`, no moving averages will be 
  calculated, allowing you to view every tiny disruption in framerate. You 
  can use this to home in on common wasteful coding practices such as 
  allocating too many temporary objects. This sort of optimization will 
  produce a smoother-flowing application with fewer and shorter pauses as 
  the JavaScript garbage collector is run.

You can also get the current framerate any time after the framerate has been
added to the world by calling `fps`.

###
class Jax.Framerate extends Jax.Model
  drawPath = (ctx, points, height, current)->
    ctx.beginPath()
    ctx.moveTo 0, clamp height - points[0] * height, 0, height
    for i in [0..current]
      ctx.lineTo i, clamp height - points[i] * height, 0, height
    ctx.stroke()
    ctx.closePath()

  clamp = (val, min, max) ->
    if val < min then min
    else if val > max then max
    else val
  
  constructor: (options = {}) ->
    options.stroke or= "rgba(0, 0, 0, 255)"
    options.fill or= "rgba(255, 0, 255, 255)"
    options.width or= 128
    options.height or= 64
    # Instead of disabling depth tests, we'll just position it in ortho
    # right in front of the camera. This way it still registers a depth
    # value, and other objects aren't (usually) rendered in front of it,
    # which means we don't need to control the render order as strictly.
    options.position or= [options.width / 2, options.height / 2, -0.1001]
    options.castShadow or= false
    options.receiveShadow or= false
    options.illuminated or= false
    options.fontHeight or= 12
    super options
    
    @canvas = document.createElement 'canvas'
    @canvas.width  = @width
    @canvas.height = @height
    @ctx = @canvas.getContext '2d'
    @ctx.font      = @font or= "#{@fontHeight}px Arial"

    @history = []
    @current = -1
    @max_fps = 100
    @ema = 30 if @ema is undefined
    
    # cache some variables for use during update
    @ema_exponent = 2 / (@ema + 1)
    @_max_data_width       = @width / 3
    @_fps_label_left       = 0
    @_one_quarter_height   = @height * 0.25
    @_two_quarter_height   = @height * 0.5
    @_three_quarter_height = @height * 0.75
    @_12_pcnt_height       = @height * 0.12
    @_marker_offset        = @width - @_12_pcnt_height
    @_max_queue_size       = Math.round(@width - @_12_pcnt_height)
    
    @glTex = new Jax.Texture
      width: @width
      height: @height
      mag_filter: GL_LINEAR
      min_filter: GL_LINEAR
      flip_y: true
      wrap_s: GL_CLAMP_TO_EDGE
      wrap_t: GL_CLAMP_TO_EDGE
      
    @glTex.image = @canvas
    @mesh = new Jax.Mesh.Quad
      width: @width
      height: @height
      color: [1, 1, 1, 1]
      transparent: true
      material: new Jax.Material.Custom
        layers: [
          { type: 'Position' },
          { type: 'VertexColor' },
          { type: 'Texture', instance: @glTex }
        ]

  render: (context, material) ->
    @fps = context.getFramesPerSecond()
    fpsPcnt = @fps / @max_fps
    
    if @fps is Number.POSITIVE_INFINITY then @fps = fpsPcnt = 0
    
    if @current == @_max_queue_size
      for i in [0..@current]
        @history[i] = @history[i+1]
    else @current++
    
    if @ema
      # calculate exponential moving average
      if @current == 0
        curEMA = 0
      else
        curEMA = @history[@current-1]
      @history[@current] = curPcnt = (fpsPcnt * @ema_exponent) + (curEMA * (1 - @ema_exponent))
    else
      @history[@current] = curPcnt = fpsPcnt
    
    # clear the graph
    @ctx.clearRect 0, 0, @width, @height

    if !@ema or @current >= @ema
      @ctx.strokeStyle = @fill
      drawPath @ctx, @history, @height, @current

      @ctx.textBaseline = "center"

      x = @width - @fontHeight * 4.25
      y = clamp @height - (curPcnt * @height + 5), @fontHeight, @height

      @ctx.strokeStyle = @stroke
      @ctx.strokeText "#{Math.round @fps} FPS", x, y

      @ctx.fillStyle = @fill
      @ctx.fillText "#{Math.round @fps} FPS", x, y
    else
      @ctx.strokeStyle = @stroke
      @ctx.fillText "Gathering data...", 10, @height / 2, @width - 20

      @ctx.fillStyle = "rgba(128, 128, 128, 255)"
      @ctx.fillText "Gathering data...", 10, @height / 2, @width - 20
      
    @glTex.refresh context
    
    unless @ortho
      @camera.ortho
        left: 0
        right: context.canvas.width
        bottom: 0
        top: context.canvas.height
      @ortho = @camera.getProjectionMatrix()
      @identity = mat4.identity mat4.create()
    
    stack = context.matrix_stack
    stack.push()
    stack.loadProjectionMatrix @ortho
    stack.loadViewMatrix @identity
    stack.multModelMatrix @camera.getTransformationMatrix()
    @mesh.render context, this, material
    stack.pop()
    