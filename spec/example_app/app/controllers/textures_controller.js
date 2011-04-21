//= require "application_controller"

var TexturesController = (function() {
  return Jax.Controller.create("textures", ApplicationController, {
    index: function() {
      var tex_mat = new Jax.Material({
        ambient: [0.1,0.1,0.1,1],
        diffuse: [0.2,0.2,0.2,1],
        textures:[
          {type:Jax.NORMAL_MAP,flip_y:true,path:"/public/images/normal_map.jpg",scale:3}
//          "/public/images/rss.png"
        ]
      });
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: [2,0,-15],
        direction: [0,0,-1],
        color: {
          ambient: [0,0,0,1],
          diffuse: [0.5,0.5,0.5,1],
          specular:[1,1,1,1]
        },
        attenuation: {
          constant: 0,
          linear: 0.2,
          quadratic: 0
        },
        shadowcaster: false
      }));
      
      this.world.addObject(new Jax.Model({position:[0,0,-20],mesh: new Jax.Mesh.Quad({size:10,material:tex_mat})}));
    },
    
    /* dragging the mouse will rotate the object */
    mouse_moved: function(event) {
      var camera = this.world.getObject(0).camera;
//      camera.rotate(0.0375, [0, 0, -this.context.mouse.diffy]);
      camera.rotate(0.0375, [this.context.mouse.diffx, 0, -this.context.mouse.diffy]);
    }
  });
})();
