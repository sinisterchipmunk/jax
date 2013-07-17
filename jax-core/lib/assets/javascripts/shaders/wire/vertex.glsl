uniform vec2 WIN_SCALE;
uniform mat4 MVP;

attribute vec4 position;
attribute vec4 p1_3d;
attribute vec4 p2_3d;

void main(void)
{
	 // We store the vertex id (0,1, or 2) in the w coord of the vertex
	 // which then has to be restored to w=1.
	 float swizz = p1_3d.w;
	 vec4 p1_3d_ = p1_3d;
	 p1_3d_.w = 1.0;
	 
	 // Compute the vertex position in the usual fashion.
   gl_Position = MVP * position;
   
	 // p0 is the 2D position of the current vertex.
	 vec2 p0 = gl_Position.xy/gl_Position.w;
	 
	 // Project p1 and p2 and compute the vectors v1 = p1-p0
	 // and v2 = p2-p0
	 p1_3d_ = MVP * p1_3d_;
	 vec2 v1 = WIN_SCALE*(p1_3d_.xy / p1_3d_.w - p0);
	 vec4 p2_3d_ = MVP * p2_3d;
	 vec2 v2 = WIN_SCALE*(p2_3d_.xy / p2_3d_.w - p0);
	 
	 // Compute 2D area of triangle.
	 float area2 = abs(v1.x*v2.y - v1.y * v2.x);
	 
   // Compute distance from vertex to line in 2D coords
   float h = area2/length(v1-v2);
   
   // ---
   // The swizz variable tells us which of the three vertices
   // we are dealing with. The ugly comparisons would not be needed if
   // swizz was an int.
   if(swizz<0.1)
      dist = vec3(h,0,0);
   else if(swizz<1.1)
      dist = vec3(0,h,0);
   else
      dist = vec3(0,0,h);
      
   // ----
   // Quick fix to defy perspective correction
   dist *= gl_Position.w;
}
