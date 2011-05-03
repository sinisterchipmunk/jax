//= require "application_controller"

var TexturesController = (function() {
  return Jax.Controller.create("textures", ApplicationController, {
    index: function() {
      var tex_mat = new Jax.Material({
        ambient: [0.2,0.2,0.2,1],
        diffuse: [0.2,0.2,0.2,1],
        shininess: 30,
        textures:[
//          {type:Jax.NORMAL_MAP,flip_y:false,path:"/public/images/185__normalmap.png"},
          {path:"/public/images/rss.png",scale:8}
        ]
      });
      
//      var program = tex_mat.prepareShader();
//      alert(program.getVertexSource(tex_mat));
      
      this.world.addLightSource(new Jax.Scene.LightSource({
        type: Jax.POINT_LIGHT,
        position: [2,0,-15],
        direction: [0,0,-1],
        color: {
          ambient: [0,0,0,1],
          diffuse: [0.5,0.5,0.5,1],
          specular:[0.5,0.5,0.5,1]
        },
        attenuation: {
          constant: 0,
          linear: 0.25,
          quadratic: 0
        },
        shadowcaster: false
      }));

      this.world.addObject(new Jax.Model({position:[0,0,-7.5],mesh: new Jax.Mesh.Quad({size:7.5,material:tex_mat})}));
    },
    
    /* moving the mouse will rotate the object */
    mouse_moved: function(event) {
      var camera = this.world.getObject(0).camera;
      camera.rotate(0.0375, [this.context.mouse.diffy, 0, -this.context.mouse.diffx]);
    },
    
    update: function(tc) {
      var light = this.world.lighting.getLight(0).camera;
      light.p = (light.p || 0) + tc * 2.0;
      light.setPosition(Math.cos(light.p)*2.5, Math.sin(light.p)*2.5, -5);
    }
  });
})();
