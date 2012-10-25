Jax.Controller.create "keyboard",
  index: ->
    @toggle = 7
    @world.ambientColor = '#fff'
    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Sphere
      position: [0, 0, -5]

  accumToggle: (bit) ->
    if @toggle & bit then 'f' else '0'

  key_pressed: ->
    @toggle = @toggle - 1
    if @toggle == 0
      @toggle = 7
    color = '#'
    color += @accumToggle 1
    color += @accumToggle 2
    color += @accumToggle 4
    @world.ambientColor = color
