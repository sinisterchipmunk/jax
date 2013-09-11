# Very simply dumps out a noise texture that should look bumpy and/or cloudy.
# If it doesn't, noise ain't workin'.
class Noise extends Jax.Controller
  Jax.controllers.add @name, this

  index: ->
    class Jax.Material.Layer.T extends Jax.Material.Layer
      @shaderSource:
        fragment: """
        uniform float time;

        void main(void) {
          float n = snoise(vec4(gl_FragCoord.xyz * 0.025, time)) * 0.5 + 0.5;
          gl_FragColor = vec4(n, n, n, 1.0);
        }
        """
        
      setVariables: (context, mesh, model, vars, pass) ->
        vars.time = context.uptime
    
    noiseMat = new Jax.Material.Surface(layers: [{type: 'Noise'}, {type: 'T'}])
    tpmesh = new Jax.Mesh.Cube material: noiseMat
    
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -3]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.25, [1, 0.75, 0.5]
