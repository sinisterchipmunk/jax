var bufs;
if (typeof(bufs) == 'undefined') // in case it was defined elsewhere
  bufs = {};
  
// Although slower than 'tri_tri_intersect', this implementation
// will find and store the exact point of intersection.

// t1, t2: a triangle
// dest: a vec3 to contain intersection point
// If the return value is false, the value of dest will be unknown.
function slow_tri_tri_intersect(t1, t2, dest)
{
  var line1 = bufs.slowtri_line1 = bufs.slowtri_line1 || new Jax.Geometry.Line();
  var line2 = bufs.slowtri_line2 = bufs.slowtri_line2 || new Jax.Geometry.Line();
  if (t1.plane.intersectTriangle(t2, line1) && t2.plane.intersectTriangle(t1, line2)) {
    line1.intersectLineSegment(line2, dest);
    return true;
  }
  else return false;
}
