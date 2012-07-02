# Very simply dumps out a noise texture that should look bumpy and/or cloudy.
# If it doesn't, noise ain't workin'.
Jax.Controller.create "noise",
  index: ->
    noiseMat = new Jax.Material.Surface(layers: [{type: 'Noise'}])
    noiseMat.shader.fragment.append """
    void main(void) {
      gl_FragColor = vec4(snoise(gl_FragCoord), snoise(gl_FragCoord), snoise(gl_FragCoord), 1.0);
    }
    """
    tpmesh = new Jax.Mesh.Cube material: noiseMat
    
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -3]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.25, 1, 0.75, 0.5
