###

A visual frames per second counter that can be added to the world like any other
model:

    @world.addObject new Jax.Framerate

Several options can be passed:

    width  - the width in pixels, defaults to 128
    height - the height in pixels, defaults to 64
    font   - the font, defaults to "10pt Arial"
    ema    - a number, or false (see below), defaults to 30
    left   - the left pixel coordinate of the counter
    top    - the top pixel coordinate of the counter

After instantiation, the counter can be manipulated just like any other Jax model
(e.g. `new Jax.Framerate().camera.getPosition()`) except that it uses pixel coordinates
instead of world units and is displayed with an orthographic (essentially 2D) projection.

The framerate is capable of two modes of operation

* EMA - calculates an exponential moving average of the framerate based on the
  `ema` option, producing a smooth line on the graph, allowing you to visually
  "skip over" temporary disruptions such as garbage collection, and giving you
  the "big picture".
* Instant - if the `ema` option is `false`, no moving averages will be calculated,
  allowing you to view every tiny disruption in framerate. You can use this to
  home in on common wasteful coding practices such as allocating too many temporary
  objects. This sort of optimization will produce a smoother-flowing application
  with fewer and shorter pauses as the JavaScript garbage collector is run.

You can also get the current framerate any time after the framerate has been
added to the world by calling `fps` or `ups`.

###
class Jax.Framerate extends Jax.Model
  drawPath = (ctx, points, height, current)->
    ctx.beginPath()
    ctx.moveTo 0, height - points[0] * height
    for i in [0..current]
      ctx.lineTo i, height - points[i] * height
    ctx.stroke()
    ctx.closePath()
  
  constructor: (options = {}) ->
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
    super options
    
    @canvas = document.createElement 'canvas'
    @canvas.width  = @width
    @canvas.height = @height
    @ctx = @canvas.getContext '2d'
    @ctx.font      = @font or= "10pt Arial"
    
    @fps_points = []
    @ups_points = []
    @current = -1
    @max_fps = @max_ups = 100
    @ema = 30 if @ema is undefined
    
    # cache some variables for use during update
    @ema_exponent = 2 / (@ema + 1)
    @_max_data_width = @width / 3
    @_fps_label_left = 0
    @_ups_label_left = @width / 3 + @width / 6
    @_one_quarter_height = @height * 0.25
    @_two_quarter_height = @height * 0.5
    @_three_quarter_height = @height * 0.75
    @_12_pcnt_height = @height * 0.12
    @_marker_offset = @width - @_12_pcnt_height
    @_max_queue_size = Math.round(@width - @_12_pcnt_height)
    
    @glTex = new Jax.Texture
      width: @width
      height: @height
      mag_filter: GL_LINEAR
      min_filter: GL_LINEAR
      flip_y: true
      
    @glTex.image = @canvas
    @mesh = new Jax.Mesh.Quad
      width: @width
      height: @height
      color: [1, 1, 1, 0.5]
      material: new Jax.Material(layers: [ { type: 'Position' }, { type: 'Texture', instance: @glTex } ])
    
  render: (context, material) ->
    @fps = context.getFramesPerSecond()
    fps_pcnt = @fps / @max_fps
    
    if fps_pcnt == Number.POSITIVE_INFINITY then fps_pcnt = 1000
    
    if @current == @_max_queue_size
      for i in [0..@current]
        @fps_points[i] = @fps_points[i+1]
    else @current++
    
    if @ema
      # calculate exponential moving average
      if @current == 0
        fema = 0
        uema = 0
      else
        fema = @fps_points[@current-1]
      @fps_points[@current] = (fps_pcnt * @ema_exponent) + (fema * (1 - @ema_exponent))
    else
      @fps_points[@current] = fps_pcnt
    
    # clear the graph
    @ctx.clearRect 0, 0, @width, @height
    @ctx.fillStyle = "rgba(64, 64, 64, 0.7)"
    @ctx.fillRect 0, 0, @width, @height
    @ctx.textBaseline = "middle"
    @ctx.fillStyle = "rgba(0, 32, 0, 1)"
    @ctx.fillText "25", @_marker_offset, @_three_quarter_height, @_12_pcnt_height
    @ctx.fillStyle = "rgba(0, 32, 0, 1)" # why do I have to do this again?
    @ctx.fillText "50", @_marker_offset, @_two_quarter_height, @_12_pcnt_height
    @ctx.fillStyle = "rgba(0, 32, 0, 1)"
    @ctx.fillText "75", @_marker_offset, @_one_quarter_height, @_12_pcnt_height

    if !@ema or @current >= @ema
      # FPS or FPS EMA
      @ctx.strokeStyle = "red"
      drawPath @ctx, @fps_points, @height, @current
      
      @ctx.textBaseline = "bottom"
      @ctx.fillStyle = "red"
      @ctx.fillText "#{Math.round @fps} FPS", @_fps_label_left, @height, @_max_data_width
    else
      @ctx.fillStyle = "rgba(0, 0, 0, 1)"
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
    mat4.copy stack.getProjectionMatrix(), @ortho
    stack.loadViewMatrix @identity
    stack.multModelMatrix @camera.getTransformationMatrix()
    @mesh.render context, this, material
    stack.pop()
    