//= require "shaders/functions/paraboloid"

shared attribute vec4 VERTEX_POSITION;
                
void main(void) {
  vec4 position = ModelView * VERTEX_POSITION;
  position /= position.w;
  position.z *= DP_DIRECTION;
  mapToParaboloid(position, 0.1, 500.0);
  gl_Position = position;
}
