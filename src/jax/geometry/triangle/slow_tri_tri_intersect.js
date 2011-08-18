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
  
  /*
  var p1 = t1.plane;
  var f1, f2, f3, f12, f23;
  var other_side=0;
  
  {
    f1=p1.classify(t2.a);
    f2=p1.classify(t2.b);
    f3=p1.classify(t2.c);
    f12=f1*f2;
    f23=f2*f3;
    if (f12>0.0 && f23>0.0)
      return false;
    other_side=(f12<0.0?(f23<0.0?1:0):2);
  }
  
  var p2 = t2.plane;
  var n12 = bufs.slowtritri_n12 = bufs.slowtritri_n12 || vec3.create();
  vec3.add(p1.normal, p2.normal, n12);
  var a2 = t2[(other_side+1) % 3];
  var b2 = t2[other_side];
  var c2 = t2[(other_side+2) % 3];

  var t21 = -(p1.d + p2.d + vec3.dot(a2, n12)) / vec3.dot(vec3.subtract(b2, a2, dest), n12);
  vec3.add(a2, vec3.scale(dest, t21, dest), dest);
  if (t1.pointInTri(dest)) return dest;
  
  var t22 = -(p1.d + p2.d + vec3.dot(c2, n12)) / vec3.dot(vec3.subtract(b2, c2, dest), n12);
  vec3.add(c2, vec3.scale(dest, t22, dest), dest);
  if (t1.pointInTri(dest)) return dest;

  {
    f1=p2.classify(t1.a);
    f2=p2.classify(t1.b);
    f3=p2.classify(t1.c);
    f12=f1*f2;
    f23=f2*f3;
    if (f12>0.0 && f23>0.0)
      return false;
    other_side=(f12<0.0?(f23<0.0?1:0):2);
  }

  var a1 = t1[(other_side+1)%3];
  var b1 = t1[other_side];
  var c1 = t1[(other_side+2)%3];
  
  var t11 = -(p1.d + p2.d + vec3.dot(a1, n12)) / vec3.dot(vec3.subtract(b1, a1, dest), n12);
  vec3.add(a1, vec3.scale(dest, t11, dest), dest);
  if (t2.pointInTri(dest)) return dest;
  
  var t12 = -(p1.d + p2.d + vec3.dot(c1, n12)) / vec3.dot(vec3.subtract(b1, c1, dest), n12);
  vec3.add(c1, vec3.scale(dest, t12, dest), dest);
  if (t2.pointInTri(dest)) return dest;
  
  return false;
  */
}
