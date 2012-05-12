// used by Jax.Mesh to build tangent-space buffer
// function makeTangentBuffer(self) {
Jax.Mesh.prototype._makeTangentBuffer = function() {
  var self = this;
  
  var normals = self.getNormalBuffer();
  var vertices = self.getVertexBuffer();
  var texcoords = self.getTextureCoordsBuffer();
  var indices = self.getIndexBuffer();
  if (!normals || !vertices || !texcoords) return null;

  var tangentBuffer = self.tangent_buffer;
  normals = normals.js;
  vertices = vertices.js;
  texcoords = texcoords.js;
  if (indices && indices.length > 0) indices = indices.js;
  else indices = null;
  
  var tangents = tangentBuffer ? tangentBuffer.js : [];
  var tan1 = [], tan2 = [], a;
  var v1 = vec3.create(), v2 = vec3.create(), v3 = vec3.create();
  var w1 = [], w2 = [], w3 = [];
  var vertcount;
  var x1, x2, y1, y2, z1, z2, s1, s2, t1, t2, r;
  var dif = [];
  var sdir = vec3.create(), tdir = vec3.create();
  
  function setv(v, a) { v[0] = vertices[a*3];  v[1] = vertices[a*3+1];  v[2] = vertices[a*3+2]; }
  function setw(w, a) { w[0] = texcoords[a*2]; w[1] = texcoords[a*2+1]; }
  function sett1(a) { tan1[a] = tan1[a] || vec3.create(); vec3.add(tan1[a], sdir, tan1[a]); }
  function sett2(a) { tan2[a] = tan2[a] || vec3.create(); vec3.add(tan2[a], tdir, tan2[a]); }
  function findTangentVector(a1, a2, a3) {
    if (indices) { a1 = indices[a1]; a2 = indices[a2]; a3 = indices[a3]; }
    
    setv(v1, a1); setv(v2, a2); setv(v3, a3);
    setw(w1, a1); setw(w2, a2); setw(w3, a3);
    x1 = v2[0] - v1[0]; x2 = v3[0] - v1[0];
    y1 = v2[1] - v1[1]; y2 = v3[1] - v1[1];
    z1 = v2[2] - v1[2]; z2 = v3[2] - v1[2];
    s1 = w2[0] - w1[0]; s2 = w3[0] - w1[0];
    t1 = w2[1] - w1[1]; t2 = w3[1] - w1[1];
    r = 1.0 / (s1 * t2 - s2 * t1);
    
    sdir[0] = (t2 * x1 - t1 * x2) * r; sdir[1] = (t2 * y1 - t1 * y2) * r; sdir[2] = (t2 * z1 - t1 * z2) * r;
    tdir[0] = (s1 * x2 - s2 * x1) * r; tdir[1] = (s1 * y2 - s2 * y1) * r; tdir[2] = (s1 * z2 - s2 * z1) * r;
    
    if (isNaN(sdir[0]) || isNaN(sdir[1]) || isNaN(sdir[2]) ||
        isNaN(tdir[0]) || isNaN(tdir[1]) || isNaN(tdir[2]) )
    {
      // this only seems to happen when dealing with degenerate triangles
      // ...which seems to be fairly common. So, let's see what happens if
      // we just set the offending vectors to zero.
      sdir[0] = sdir[1] = sdir[2] = tdir[0] = tdir[1] = tdir[2] = 0;
    }
    sett1(a1); sett1(a2); sett1(a3);
    sett2(a1); sett2(a2); sett2(a3);
  }
  
  vertcount = indices && indices.length > 0 ? indices.length : normals.length / 3;

  /* we need to pass the vertices into findTangentVector differently depending on draw mode */
  /* TODO refactor: merge this with mesh support */
  switch(self.draw_mode) {
    case GL_TRIANGLE_STRIP:
      for (a = 2; a < vertcount; a += 2) {
        findTangentVector(a-2, a-1, a);
        findTangentVector(a, a-1, a+1);
      }
      break;
    case GL_TRIANGLES:
      for (a = 0; a < vertcount; a += 3)
        findTangentVector(a, a+1, a+2);
      break;
    case GL_TRIANGLE_FAN:
      for (a = 2; a < vertcount; a++)
        findTangentVector(0, a-1, a);
      break;
    default:
      throw new Error("Cannot calculate tangent space for draw mode: "+Jax.Util.enumName(self.draw_mode));
  }

  var normal = vec3.create();

  // remove any tangents left over from earlier builds (this should be pretty rare)
  while (tangents.length > vertcount) tangents.pop();

  var b;
  for (b = 0; b < vertcount; b++) {
    
    if (indices) a = indices[b];
    else a = b;
    
    // Gram-Schmidt orthogonalize: (t - n * dot(n, t)).normalize()
    normal[0] = normals[a*3]; normal[1] = normals[a*3+1]; normal[2] = normals[a*3+2];
    vec3.scale(normal, vec3.dot(normal, tan1[a]), dif);
    vec3.subtract(tan1[a], dif, dif);
    vec3.normalize(dif);
        
    tangents[a*4] = dif[0];
    tangents[a*4+1] = dif[1];
    tangents[a*4+2] = dif[2];
    // calc handedness
    tangents[a*4+3] = (vec3.dot(vec3.cross(normal, tan1[a]), tan2[a])) < 0.0 ? -1.0 : 1.0;
  }
  
  if (tangentBuffer)
    self.tangent_buffer.refresh();
  else
    self.tangent_buffer = new Jax.NormalBuffer(tangents);
  return self.tangent_buffer;
}