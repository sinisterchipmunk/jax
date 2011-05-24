/**
 * class Blob < Jax.Model
 * 
 **/
var Blob = (function() {
  return Jax.Model.create({
    update: function(tc) {
      this.mesh.material.time = (this.mesh.material.time || 0) + tc;
      this.camera.rotate(tc, [1,0,0]);
    },
    
     after_initialize: function() {
      var u = (2*Math.PI)/16, v = (Math.PI/16);
      
      this.mesh = new Jax.Mesh({
        material: Material.find("blob"),
        
        init: function(vertices, colors, textureCoords, normals, indices) {
          for (var x = 0; x < 64; x++) {
            for (var y = 0; y < 64; y++) {
              var u = x, v = y;
              
              vertices.push(u, v, 0);
              vertices.push(u+1, v, 0);
              vertices.push(u, v+1, 0);
          
              vertices.push(u, v+1, 0);
              vertices.push(u+1, v, 0);
              vertices.push(u+1, v+1, 0);
            }
          }
        }
      });
      
      this.mesh.material.u = u;
      this.mesh.material.v = v;
    }
  });
})();
