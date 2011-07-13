// (re)calculates vertex normals based on Jax.Mesh vertex data

function calculateNormals(mesh) {
  var triangles = mesh.getTriangles();
  var normals = {}, i;
  
  // it's much slower to nest an iteration within an iteration; instead
  // we'll create properties in +normals+ and then enumerate the properties
  // later.
  for (i = 0; i < triangles.length; i++) {
    var tri = triangles[i];
    normals[tri.a] = normals[tri.a] || [];
    normals[tri.b] = normals[tri.b] || [];
    normals[tri.c] = normals[tri.c] || [];
    normals[tri.a].push(tri.getNormal());
    normals[tri.b].push(tri.getNormal());
    normals[tri.c].push(tri.getNormal());
  }
  
  var normal = vec3.create();
  mesh.dataRegion.remap(mesh.normalData, triangles.length * 9);
  for (i = 0; i < mesh.vertices.length; i++) {
    var v = mesh.vertices[i].array;
    if (normals[v]) {
      normal[0] = normal[1] = normal[2] = 0;
      for (var j = 0; j < normals[v].length; j++)
        vec3.add(normal, normals[v][j], normal);
      vec3.scale(normal, 1/normals[v].length);
      
      vec3.set(normal, mesh.normals[i].array);
    }
  }
  
  // finally, update or create the WebGL buffer
  mesh.buffers.normal_buffer.refresh();
}
