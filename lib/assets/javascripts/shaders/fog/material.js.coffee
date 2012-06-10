Jax.LINEAR = 1
Jax.EXPONENTIAL = 2
Jax.EXP2 = 3

class Jax.Material.Fog extends Jax.Material.Layer
  constructor: (options, material) ->
    super options, material
    
    @shader or= "fog"
    @start or= 10
    @end or= 100
    @density or= 0.0015
    @color = Jax.Util.colorize(@color || Jax.Color.parse("#fff").toVec4())
    @algorithm or= Jax.EXP2
    
    switch @algorithm
      when Jax.LINEAR, Jax.EXPONENTIAL, Jax.EXP2 then ;
      when 'LINEAR', 'EXPONENTIAL', 'EXP2' then options.algorithm = Jax[options.algorithm]
      else throw new Error "Jax: Fog algorithm must be one of LINEAR, EXPONENTIAL, or EXP2"
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.End = @end
    vars.Scale = 1.0 / (@end - @start)
    vars.Algorithm = @algorithm
    vars.Density = @density
    vars.FogColor = @color
