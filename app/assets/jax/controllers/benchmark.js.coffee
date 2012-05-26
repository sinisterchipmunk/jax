#= require 'benchmark'

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
    
    
  benchmark_complete: ->
    max = 5
    k = 0
    
    for i in [0..max]
      for j in [0..max]
        for k in [0..max]
          @world.addObject new Jax.Model
            position: [i - 2.5, j - 2.5, -k - 5]
            mesh: new Jax.Mesh.Sphere
              radius: 0.25
              color: [i / max, j / max, k / max, 1]
    
    # @world.addObject new Jax.Model position: [0, 0, -5], mesh: new Jax.Mesh.Sphere
    @world.addObject new Jax.Framerate ema: no
