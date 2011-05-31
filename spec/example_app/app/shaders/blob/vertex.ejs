shared attribute vec4 VERTEX_POSITION, VERTEX_TANGENT;
shared attribute vec3 VERTEX_NORMAL;

uniform float time;

#define PI 3.141592653589793

vec3 sphere(in float slice, in float stack) {
  vec3 res;
  
  float theta = (slice / 64.0) * PI,
        phi   = (stack / 64.0) * 2.0 * PI;
  float sinth = sin(theta), costh = cos(theta),
        sinph = sin(phi),   cosph = cos(phi);

  res.x = cosph * sinth;
  res.y = costh;
  res.z = sinph * sinth;

  float n = snoise(vec4(res, time*0.5)) * 0.5;
  res += normalize(res)*n;
  
  return res;
}

void main(void) {
  vec3 pos = sphere(VERTEX_POSITION.x, VERTEX_POSITION.y);
  vec3 a = sphere(VERTEX_POSITION.x+1.0, VERTEX_POSITION.y);
  vec3 b = sphere(VERTEX_POSITION.x, VERTEX_POSITION.y+1.0);

  a = (a - pos);
  b = (b - pos);

  vNormal = nMatrix * cross(b, a);

  vSurfacePos = (mvMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = pMatrix * mvMatrix * vec4(pos, 1.0);

  vBaseColor = vec4(1,1,1,1);
}
