class Jax.Material.VertexColor extends Jax.Material.Layer
  setVariables: (context, mesh, model, vars, pass) ->
    vars.set
      PASS: pass
      
    mesh.data.set vars,
      colors:   'VERTEX_COLOR'
