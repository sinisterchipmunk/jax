// uniform vec4 WireColor;
// uniform vec4 FillColor;

void main(void)
{
  // Undo perspective correction.
	vec3 dist_vec = dist * gl_FragCoord.w;
	
  // Compute the shortest distance to the edge
	float d =min(dist_vec[0],min(dist_vec[1],dist_vec[2]));
	
	// Compute line intensity and then fragment color
 	float I = exp2(-2.0*d*d);
 	
  const vec4 fillColor = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 wireColor = gl_FragColor;
 	
 	gl_FragColor = I*wireColor + (1.0 - I)*fillColor;
}
