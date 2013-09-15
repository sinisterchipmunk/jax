#= require jax/texture
#= require_tree .

class Jax.Material.Layer.CubeMap extends Jax.Material.Layer
  center = vec3.create()
  origin = vec3.create()
  identity = mat3.identity mat3.create()

  ###
    HACK that makes cube textures magically work on my machine.
    This may be a driver bug. If so, we can remove the hack when the driver
    becomes fixed, blacklisted or obsolete.
    
    Symptom: If the first texture to be bound is a TEXTURE_CUBE_MAP,
    Invalid Operation errors start popping up all over. If the first bound
    texture is a TEXTURE_2D, everything works just fine.
    
    NOTE: There is some performance cost to this hack, because in order to
    prevent the GLSL compiler from simply removing unused samplers we have
    to actually sample the `HAX` texture in the shader. So, it behooves us
    to remove the hack as soon as possible.
  ###
  HAX = new Jax.Texture()

  shaders:
    common:   Jax.shaderTemplates['shaders/cube_map/common']
    vertex:   Jax.shaderTemplates['shaders/cube_map/vertex']
    fragment: Jax.shaderTemplates['shaders/cube_map/fragment']

  constructor: (options, material) ->
    unless @cubeMap = options.cubeMap
      throw new Error "Jax.Material.Layer.CubeMap requires a `cubeMap` option which must be an instance of Jax.Texture.CubeMap"
    @cubeMap = options.cubeMap
    @space = options.space || 'world'
    @map =
      vertices: 'CVERTEX'
      normals : 'CVNORMAL'

    super options, material

  numPasses: -> 1
  
  setVariables: (context, mesh, options, vars) ->
    vars.CUBE_MAP = @cubeMap
    vars.HAX = HAX
    switch @space
      when 'object' then vars.CNORMAL_MATRIX = @identity
      when 'world'  then vars.CNORMAL_MATRIX = context.matrix_stack.getModelNormalMatrix()
      when 'eye'    then vars.CNORMAL_MATRIX = context.matrix_stack.getNormalMatrix()
      else throw new Error "Space must be one of 'object', 'world' or 'eye'; got '#{@space}'"
    mesh.data.set vars, @map
