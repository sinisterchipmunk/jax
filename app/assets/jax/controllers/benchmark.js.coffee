#= require 'benchmark'

MAX = 5

log = null
Jax.Controller.create "benchmark",
  index: ->
    log = document.getElementById('benchmark-log') || (->
      _log = document.createElement 'div'
      _log.setAttribute 'id', 'benchmark-log'
      $(_log).css 'font-family', 'monospace'
      document.body.appendChild _log
      return $(_log);
    )()
    
    @benchmark_complete()
    # @instantiation()
    
  instantiation: ->
    self = this
    suite = new Benchmark.Suite
    
    suite.add 'Jax.Mesh.Cube (new)', ->
      return new Jax.Mesh.Cube().data.vertexBuffer
    
    suite.on 'cycle', (event, bench) ->
      log.html (log.html() || "") + "<p>Instantiation - #{event.target}</p>"
      
    suite.on 'complete', ->
      log.html (log.html() || "") + "<p>Instantiation - Fastest is #{@filter('fastest').pluck('name')}</p>"
      self.rendering()
    
    suite.run({ 'async': true });
    
  rendering: ->
    self = this
    suite = new Benchmark.Suite
    model = new Jax.Model()
    new_cube = new Jax.Mesh.Cube()
    
    # prepare the buffers
    new_cube.data.vertexBuffer
    
    suite.add 'Jax.Mesh.Cube (new)', =>
      new_cube.render @context, model
    
    suite.on 'cycle', (event, bench) ->
      log.html (log.html() || "") + "<p>Rendering - #{event.target}</p>"
      
    self = this
    suite.on 'complete', ->
      log.html (log.html() || "") + "<p>Rendering - Fastest is #{@filter('fastest').pluck('name')}</p>"
      self.benchmark_complete()
    
    suite.run({ 'async': true });
    
    
  update: (tc) ->
    tc *= 0.5
    @_rotation or= 0
    @_rotation += tc
    position = @_position or= vec3.create()
    origin = @_origin or= vec3.create()
    radius = MAX / 2 + 1
    
    position[0] = Math.cos(@_rotation) * radius
    position[1] = 0
    position[2] = Math.sin(@_rotation) * radius
    
    @context.activeCamera.lookAt origin, position
    
  benchmark_complete: ->
    max = MAX
    k = 0
    
    @world.addLight new Jax.Light.Directional
      color:
        ambient: "#000"
        diffuse: '#ccc'
        specular: "#fff"
    @activeCamera.position = [0, 0, 10]
    
    for i in [0..max]
      for j in [0..max]
        for k in [0..max]
          @world.addObject new Jax.Model
            position: [i - 2.5, j - 2.5, k - 2.5]
            castShadow: false
            mesh: new Jax.Mesh.Sphere
              radius: 0.25
              color: [1, 1, 1, 1]
              material: new Jax.Material.Surface
                intensity:
                  diffuse: 1.25
                color:
                  diffuse: [i / max, j / max, k / max, 1]
    
    @world.addObject new Jax.Framerate ema: no
