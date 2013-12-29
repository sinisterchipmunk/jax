# Very simply dumps out a noise texture that should look bumpy and/or cloudy.
# If it doesn't, noise ain't workin'.
class Noise extends Jax.Controller
  Jax.controllers.add @name, this

  class NoiseMaterial extends Jax.Material.Surface
    shaders:
      common: Jax.Material.Surface::shaders.common
      vertex: Jax.Material.Surface::shaders.vertex
      fragment: (obj) -> """
        #{Jax.shaderTemplates['shaders/lib/noise'](obj)}
        uniform float time;

        void main(void) {
          float n = snoise(vec4(gl_FragCoord.xyz * 0.025, time)) * 0.5 + 0.5;
          gl_FragColor = vec4(n, n, n, 1.0);
        }
      """
      
    registerBinding: (binding) ->
      super binding
      Jax.noise.bind binding
      binding.on 'prepare', ->
        binding.set 'time', binding.context.uptime
  
  index: ->
    tpmesh = new Jax.Mesh.Cube material: new NoiseMaterial
    
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -3]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.25, [1, 0.75, 0.5]
