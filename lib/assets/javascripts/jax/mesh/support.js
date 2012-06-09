// Support functions used by Jax.Mesh

if (Jax.OldMesh) {
  Jax.OldMesh.prototype.eachTriangle = function(callback) {
    var mesh = this;
    var vertcount, a;
  
    var indices = mesh.getIndexBuffer(), vertices = mesh.vertices;
    if (vertices.length == 0) return;
  
    if (indices) {
      if (indices.length == 0) return;
      indices = indices.getTypedArray();
      vertcount = indices.length;
    } else
      vertcount = vertices.length;
    
    function call(i1, i2, i3) {
      var v1, v2, v3, i = false;
    
      if (indices) {
        i = true;
        v1 = vertices[indices[i1]];
        v2 = vertices[indices[i2]];
        v3 = vertices[indices[i3]];
      } else {
        i = false;
        v1 = vertices[i1];
        v2 = vertices[i2];
        v3 = vertices[i3];
      }
      
      if (!v1 || !v2 || !v3) return;
      callback(v1.array, v2.array, v3.array);
    }
  
    switch(mesh.draw_mode) {
      case GL_TRIANGLE_STRIP:
        for (a = 2; a < vertcount; a += 2) {
          call(a-2, a-1, a);
          call(a, a-1, a+1);
        }
        break;
      case GL_TRIANGLES:
        for (a = 0; a < vertcount; a += 3)
          call(a, a+1, a+2);
        break;
      case GL_TRIANGLE_FAN:
        for (a = 2; a < vertcount; a++)
          call(0, a-1, a);
        break;
      default:
        return;
    }
  };

  Jax.OldMesh.prototype.buildTriangles = function() {
    var mesh = this;
    mesh.triangles.clear();
  
    mesh.eachTriangle(function(v1, v2, v3) {
      var tri = new Jax.Geometry.Triangle();
      tri.assign(v1, v2, v3);
      mesh.triangles.push(tri);
    });
  };

  Jax.OldMesh.prototype.calculateBounds = function(vertices) {
    var self = this;
    if (vertices.length == 0) {
      self.bounds.left = self.bounds.right = 0;
      self.bounds.top = self.bounds.bottom = 0;
      self.bounds.front = self.bounds.back = 0;
      self.bounds.width = self.bounds.height = self.bounds.depth = 0;
    } else {
      self.bounds.left = self.bounds.right = null;
      self.bounds.top = self.bounds.bottom = null;
      self.bounds.front = self.bounds.back = null;
      self.bounds.width = self.bounds.height = self.bounds.depth = null;
    }

    var i, v;
  
    for (i = 0; i < vertices.length; i++)
    {
      // x, i % 3 == 0
      v = vertices[i];
      if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
      if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;
    
      // y, i % 3 == 1
      v = vertices[++i];
      if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
      if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;
    
      // z, i % 3 == 2
      v = vertices[++i];
      if (self.bounds.front == null || v > self.bounds.front)  self.bounds.front  = v;
      if (self.bounds.back  == null || v < self.bounds.back)   self.bounds.back   = v;
    }
  
    self.bounds.width = self.bounds.right - self.bounds.left;
    self.bounds.height= self.bounds.top   - self.bounds.bottom;
    self.bounds.depth = self.bounds.front - self.bounds.back;
  };
}
