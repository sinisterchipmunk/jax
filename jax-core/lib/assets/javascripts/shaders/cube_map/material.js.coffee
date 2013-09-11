#= require jax/texture

class Jax.Material.Layer.CubeMap extends Jax.Material.Layer
  center = vec3.create()
  origin = vec3.create()
  identity = mat3.identity mat3.create()
  HAX = new Jax.Texture()

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
