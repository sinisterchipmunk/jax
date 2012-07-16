void main(void) {
  /*
    Note that the agorithm here must be followed exactly on the JS side in order
    to reconstitute the index when it is read.
    
    This supports 65,535 objects. If more are needed, we could feasibly open up
    the alpha channel, as long as blending is disabled. Need to do more tests
    on this first, however.
  */
  
  
  // equivalent to [ int(INDEX/256), INDEX % 256 ] / 255. The last division
  // is necessary to scale to the [0..1] range.
  
  float d = 1.0 / 255.0;
  float f = floor(INDEX / 256.0);
  vPickingColor = vec4(f * d, (INDEX - 256.0 * f) * d, 1.0, 1.0);
}
