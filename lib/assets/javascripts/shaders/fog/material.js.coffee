Jax.LINEAR = 1
Jax.EXPONENTIAL = 2
Jax.EXP2 = 3

class Jax.Material.Layer.Fog extends Jax.Material.Layer
  @define 'color',
    get: -> @_color
    set: (c) -> @_color = Jax.Color.parse c
    
  constructor: (options) ->
    options or= {}
    @start     = options.start
    @end       = options.end
    @density   = options.density   || 0.0025
    @algorithm = options.algorithm || Jax.EXP2
    @color     = options.color     || Jax.Color.parse '#fff'
    @color     = Jax.Util.colorize @color
    @_positionMap = vertices: 'VERTEX_POSITION'
    super options
    
    switch @algorithm
      when Jax.LINEAR, Jax.EXPONENTIAL, Jax.EXP2 then ;
      when 'LINEAR', 'EXPONENTIAL', 'EXP2'
        options.algorithm = Jax[options.algorithm]
      else
        throw new Error "Jax: Fog algorithm must be one of LINEAR, EXPONENTIAL, or EXP2"
    
  setVariables: (context, mesh, model, vars, pass) ->
    if @start then vars.Start = @start
    else vars.Start = (context.activeCamera.projection?.near) || 0.1
    if @end then vars.End = @end
    else vars.End = (context.activeCamera.projection?.far) || 200
    
    vars.Scale = 1.0 / (vars.End - vars.Start)
    vars.Algorithm = @algorithm
    vars.Density = @density
    vars.FogColor = @color
    vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix()
    mesh.data.set vars, @_positionMap
    