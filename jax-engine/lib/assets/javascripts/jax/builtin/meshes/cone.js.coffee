class Jax.Mesh.Cone extends Jax.Mesh.TriangleFan
  constructor: (options) ->
    options or= {}
    options.sides or= 8
    options.size or= 1
    options.radius or= options.size / 2
    options.height or= options.size
    super options
    if @sides < 3 then throw new Error "Cone requires minimum 3 sides"
    
  init: (vertices, colors, textures, normals) ->
    vertices.push 0, @height / 2, 0
    textures.push 0, 0
    delta = Math.PI * 2 / @sides
    
    for side in [0..-@sides]
      x = Math.cos(side * delta)
      z = Math.sin(side * delta)
      vertices.push x * @radius, -@height / 2, z * @radius
      textures.push x * 0.5 + 0.5, z * 0.5 + 0.5
