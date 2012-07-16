//= require "shaders/functions/paraboloid"

shared attribute vec4 VERTEX_POSITION;
                
void main(void) {
  vec4 position = ModelView * VERTEX_POSITION;
  position /= position.w;
  position.z *= Direction;
  mapToParaboloid(position, Near, Far);
  gl_Position = position;
}
