//= require "application_controller"

var PickingController = (function() {
  return Jax.Controller.create("picking", ApplicationController, {
    index: function() {
      function mesh() { return new Jax.Mesh.Sphere({size: 1.0}); };

      ofront       = this.world.addObject(new Jax.Model({position:[ 0.0, 0.0,-5],mesh:mesh()}));
      otopleft     = this.world.addObject(new Jax.Model({position:[-2.5, 2.5,-5],mesh:mesh()}));
      otopright    = this.world.addObject(new Jax.Model({position:[ 2.5, 2.5,-5],mesh:mesh()}));
      obottomleft  = this.world.addObject(new Jax.Model({position:[-2.5,-2.5,-5],mesh:mesh()}));
      obottomright = this.world.addObject(new Jax.Model({position:[ 2.5,-2.5,-5],mesh:mesh()}));
    },
    
    mouse_pressed: function(e) { alert(e.x+" "+e.y); },

    mouse_moved: function(evt) {
      var obj = this.world.pick(evt.x, evt.y);
      if (obj) {
        if (this.current_obj && obj != this.current_obj) {
          this.current_obj.mesh.setColor(1,1,1,1);
        }
        obj.mesh.setColor(1,0,0,1);
      } else {
        if (this.current_obj) {
          this.current_obj.mesh.setColor(1,1,1,1);
        }
      }
      this.current_obj = obj;
    }
  });
})();
