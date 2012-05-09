Jax.Controller.create "benchmark",
  index: ->
    # max = 5
    # 
    # for i in [0..max]
    #   for j in [0..max]
    #     for k in [0..max]
    #       @world.addObject new Jax.Model
    #         position: [i - 2.5, j - 2.5, -k - 5]
    #         mesh: new Jax.Mesh.Sphere
    #           radius: 0.25
    #           color: [i / max, j / max, k / max, 1]
    
    @world.addObject new Jax.Model position: [0, 0, -5], mesh: new Jax.Mesh.Sphere
    @world.addObject new Jax.Framerate ema: no
