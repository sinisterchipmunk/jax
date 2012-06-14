#= require "jax/material/layer"

###
A superclass for layers which are light-dependent. It allows
subclasses to skip checking the pass number or distance to
the light source.
###
class Jax.Material.IlluminationLayer extends Jax.Material.Layer
  ###
  The number of passes required for an illumination layer is an
  ambient pass plus one pass per light source. It's safe to
  override this if a particular layer follows a different scheme.
  ###
  numPasses: (context) -> context.world.lights.length + 1

  ###
  Returns true if the specified model is close enough to this light
  source to be at least partially illuminated by it.
  ###
  modelInRange: (light, model) ->
    [lightPos, objPos] = [light.position, model.position]
    dist = vec3.length(vec3.subtract objPos, lightPos) - model.mesh.bounds.radius
    range = light.maxEffectiveRange()
    return range is -1 or range >= dist

  ###
  Returns immediately on ambient passes; aborts the render pass
  entirely if the light source is too far away from the specified
  model to have any effect. Otherwise, calls #illuminate.
  
  In all cases, sets the shader variable `PASS` to the pass number.
  ###
  setVariables: (context, mesh, model, vars, pass) ->
    vars.PASS = pass
    return unless pass
    light = context.world.lights[pass-1]
    return false unless @modelInRange light, model
    return @illuminate context, mesh, model, vars, light
    
  ###
  Expected to be overridden by subclasses, called when a mesh is
  about to be illuminated by a particular light. Use this to set
  shader variables. By default, this does nothing.
  ###
  illuminate: (context, mesh, model, vars, light) ->
