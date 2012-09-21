###
## A Purple Square

<canvas />
###
@world.ambientColor = '#c0f'
@world.addObject new Jax.Model
  mesh: new Jax.Mesh.Quad
  position: [0, 0, -2]


###
## A Rotating Cube

<canvas />

A cube that is rotating at a speed of 1/2 radian per second
###
@world.addLight new Jax.Light.Directional(shadows: false)
@world.addObject new Jax.Model
  mesh: new Jax.Mesh.Cube
  position: [0, 0, -2]
  update: (tc) ->
    @camera.yaw tc * 0.5


###
## Perlin Noise

<canvas />

A quad that is textured using a custom shader which makes use of Perlin noise. Noise in Jax is also available to vertex shaders, even if no vertex texture units are supported by the client.
###
class Jax.Material.Layer.NoiseTexture extends Jax.Material.Layer
  @shaderSource:
    fragment: """
      uniform float time;

      void main(void) {
        float n = snoise(vec4(gl_FragCoord.xyz * 0.05, time)) * 0.5 + 0.5;
        gl_FragColor = vec4(n, n, n, 1.0);
      }
    """
    
  setVariables: (context, mesh, model, vars, pass) ->
    vars.time = context.uptime

noiseMaterial = new Jax.Material.Custom
  layers: [
    {type: 'Position'},
    {type: 'Noise'},
    {type: 'NoiseTexture'}
  ]

@world.addObject new Jax.Model
  mesh: new Jax.Mesh.Quad
    material: noiseMaterial
  position: [0, 0, -2]
  