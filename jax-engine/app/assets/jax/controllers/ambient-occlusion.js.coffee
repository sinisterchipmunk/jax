# Screen space ambient occlusion test
class SSAO extends Jax.Controller
  Jax.controllers.add @name, this

  index: ->
    @world.ambientColor = '#fff'
    
    # @world.addLight new Jax.Light.Directional
    #   shadows: false
    #   direction: [0, -1, 0]

    sphere = new Jax.Mesh.Sphere radius: 1
    
    @world.addObject new Jax.Model
      mesh: sphere
      position: [-1, 0, -1]

    @world.addObject new Jax.Model
      mesh: sphere
      position: [ 1, 0, -1]

    @world.addObject new Jax.Model
      mesh: sphere
      position: [-1, 0,  1]

    @world.addObject new Jax.Model
      mesh: sphere
      position: [ 1, 0,  1]
      
    # FIXME Quad direction is reversed, why?
    # I think this has more to do with how meshes are constructed (facing +z) vs
    # how model cameras are initialized (facing -z). Needs moar investigations.
    @world.addObject new Jax.Model
      mesh: new Jax.Mesh.Quad(size: 5)
      position: [0, -1, 0]
      direction: [0, -1, 0]

    @activeCamera.lookAt [10, 10, 10], [0,0,0], [0,1,0]
    
