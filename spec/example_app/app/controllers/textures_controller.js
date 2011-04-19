//= require "application_controller"

var TexturesController = (function() {
  return Jax.Controller.create("textures", ApplicationController, {
    index: function() {
      var tex_mat = new Jax.Material({texture: "/public/images/rss.png"});
      this.world.addObject(new Jax.Model({position:[0,0,-20],mesh: new Jax.Mesh.Teapot({size:10,material:tex_mat})}));
    }
  });
})();
