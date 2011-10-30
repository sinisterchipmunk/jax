//= require "shaders/functions/depth_map"

void main(void) {
  vec4 pos = gl_FragCoord;
  import(exPos, pos = exPos);
  gl_FragColor = pack_depth(pos.z);
}
