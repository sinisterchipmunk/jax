//= require "shaders/functions/depth_map"

void main(void) {
  vec4 pos = gl_FragCoord;
  gl_FragColor = pack_depth(pos.z);
}
