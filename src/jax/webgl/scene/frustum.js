//= require "../../geometry"

/**
 * class Jax.Scene.Frustum
 * includes Jax.Events.Methods
 * 
 * A Frustum represents a camera's view; it encloses the entire visible area and can be used
 * to query whether any given point is visible.
 *
 * Frustums are best known for their use in frustum culling, which is the practice of testing to
 * see whether an object is on-screen or not. If it's not on-screen, then there is no reason to
 * draw it.
 *
 * Frustums can also be useful for AI programming. In Jax, all instances of Jax.Camera create and
 * maintain their own internal Jax.Scene.Frustum instance. Since nearly every object has, in turn,
 * its own Jax.Camera, almost every object can effectively "see" the objects surrounding it.
 *
 * To get a Frustum instance, see the Jax.Camera#getFrustum method. Here are some examples:
 *
 *     var playerFrustum = this.context.player.camera.getFrustum();
 *     var ogreFrustum = ogre.camera.getFrustum();
 *     // where 'ogre' is an instance of Jax.Model
 *
 **/
Jax.Scene.Frustum = (function() {
  var RIGHT = 0, LEFT = 1, BOTTOM = 2, TOP = 3, FAR = 4, NEAR = 5;
  var OUTSIDE = Jax.Geometry.Plane.BACK, INTERSECT = Jax.Geometry.Plane.INTERSECT, INSIDE = Jax.Geometry.Plane.FRONT;

  function extents(self)
  {
    /* TODO see how this can be combined with Camera#unproject */
    function extent(x, y, z)
    {
      var inf = [];
      var mm = self.mv, pm = self.p;

      //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
      var m = mat4.set(mm, mat4.create());
      
      mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
      mat4.multiply(pm, m, m);
      mat4.inverse(m, m);

      // Transformation of normalized coordinates between -1 and 1
      inf[0]=x;//*2.0-1.0;    /* x*2-1 translates x from 0..1 to -1..1 */
      inf[1]=y;//*2.0-1.0;
      inf[2]=z;//*2.0-1.0;
      inf[3]=1.0;
      
      //Objects coordinates
      var out = mat4.multiplyVec4(m, inf);
      if(out[3]==0.0)
         return [0,0,0];//null;

      out[3]=1.0/out[3];
      return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
    }
  
    var ntl = extent(-1,1,-1), ntr = extent(1,1,-1), nbl = extent(-1,-1,-1), nbr = extent(1,-1,-1),
        ftl = extent(-1,1,1), ftr = extent(1,1,1), fbl = extent(-1,-1,1), fbr = extent(1,-1,1);
  
    return {ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};
  }

  function varcube(self, position, w, h, d)
  {
    if (!self.mv || !self.p) return INSIDE;
    var p, c, c2 = 0, plane;
  
    w = w / 2.0;
    h = h / 2.0;
    d = d / 2.0;
  
    var xp = position[0]+w, xm=position[0]-w, yp=position[1]+h, ym=position[1]-h, zp=position[2]+d, zm=position[2]-d;
  
    for (p in self.planes)
    {
      plane = self.planes[p];
      c = 0;
      if (plane.distance(xp, yp, zp) > 0) c++;
      if (plane.distance(xm, yp, zp) > 0) c++;
      if (plane.distance(xp, ym, zp) > 0) c++;
      if (plane.distance(xm, ym, zp) > 0) c++;
      if (plane.distance(xp, yp, zm) > 0) c++;
      if (plane.distance(xm, yp, zm) > 0) c++;
      if (plane.distance(xp, ym, zm) > 0) c++;
      if (plane.distance(xm, ym, zm) > 0) c++;
      if (c == 0) return OUTSIDE;
      if (c == 8) c2++;
    }
    
    return (c2 == 6) ? INSIDE : INTERSECT;
  }

  function extractFrustum(self)
  {
    var frustum = self.planes;
    var e = extents(self);
  
    frustum[TOP].set(e.ntr, e.ntl, e.ftl);
    frustum[BOTTOM].set(e.nbl,e.nbr,e.fbr);
    frustum[LEFT].set(e.ntl,e.nbl,e.fbl);
    frustum[RIGHT].set(e.nbr,e.ntr,e.fbr);
    frustum[NEAR].set(e.ntl,e.ntr,e.nbr);
    frustum[FAR].set(e.ftr,e.ftl,e.fbl);
  }

  var klass = Jax.Class.create({
    /**
     * new Jax.Scene.Frustum(view, projection)
     * - view (mat4): the view matrix
     * - projection (mat4): the projection matrix
     *
     * A frustum is usually instantiated by Jax.Camera; however, if you are maintaining
     * your own view and projection matrices then it could be helpful to instantiate
     * the frustum directly. See also Jax.Frustum#update for keeping a frustum up-to-date.
     **/
    initialize: function(modelview, projection) {
      this.planes = {};
      for (var i = 0; i < 6; i++) this.planes[i] = new Jax.Geometry.Plane();
      this.setMatrices(modelview, projection);
    },
  
    /**
     * Jax.Scene.Frustum#update() -> Jax.Scene.Frustum
     *
     * A frustum must maintain the 6 planes making up its boundaries; if the view or
     * projection matrix is modified, then the frustum is no longer accurate and must
     * be updated. For improved performance, you should only call this method when the
     * corresponding matrices are actually changed (or even better, when the matrices
     * have been changed and the frustum is actually being used).
     *
     * After updating the frustum, this method will fire an 'updated' event.
     *
     * Instances of Jax.Camera maintain their own frustums; they will fire this
     * method automatically whenever doing so becomes necessary.
     **/
    update: function() {
      if (this.mv && this.p) {
        extractFrustum(this);
        this.fireEvent('updated');
      }
      return this;
    },
    
    /**
     * Jax.Scene.Frustum#setViewMatrix(view) -> Jax.Scene.Frustum
     * - view (mat4): a 4x4 matrix
     * 
     * Replaces this frustum's view matrix with the specified one and then
     * updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the view matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setViewMatrix: function(mv) { return this.setMatrices(mv, this.p); },

    /**
     * Jax.Scene.Frustum#setProjectionMatrix(proj) -> Jax.Scene.Frustum
     * - proj (mat4): a 4x4 matrix
     * 
     * Replaces this frustum's projection matrix with the specified one and then
     * updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the projection matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setProjectionMatrix: function(p) { return this.setMatrices(this.mv, p); },
  
    /**
     * Jax.Scene.Frustum#setMatrices(view, proj) -> Jax.Scene.Frustum
     * - view (mat4): the 4x4 view matrix
     * - proj (mat4): the 4x4 projection matrix
     *
     * Replaces both matrices in the frustum, and then updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the projection matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setMatrices: function(mv, p) {
      this.mv = mv;
      this.p  = p;
      this.update();
      return this;
    },
  
    /**
     * Jax.Scene.Frustum#point(p) -> Jax.Scene.Frustum.INSIDE|Jax.Scene.Frustum.OUTSIDE
     * - p (vec3): the 3D point to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified point lies within this frustum;
     * returns Jax.Scene.Frustum.OUTSIDE otherwise.
     **/
    point: function(point) {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 3) point = [arguments[0], arguments[1], arguments[2]];

      for(var i=0; i < 6; i++)
      {
        if (this.planes[i].distance(point) < 0)
          return OUTSIDE;
      }
      return INSIDE;
    },
  
    /**
     * Jax.Scene.Frustum#sphere(center, radius) -> Jax.Scene.Frustum.INSIDE|Jax.Scene.Frustum.OUTSIDE|Jax.Scene.Frustum.INTERSECT
     * - center (vec3): the center of the sphere to be tested
     * - radius (Number): the radius of the sphere to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified sphere lies entirely within this frustum;
     * Jax.Scene.Frustum.INTERSECT if the sphere lies only partially within this frustum; or
     * Jax.Scene.Frustum.OUTSIDE if the sphere lies entirely beyond the boundaries of this frustum.
     **/
    sphere: function(center, radius)
    {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 4) { center = [arguments[0], arguments[1], arguments[2]]; radius = arguments[3]; }

      var result = INSIDE, distance;
      for (var i = 0; i < 6; i++)
      {
        distance = this.planes[i].distance(center);
        if (distance < -radius) return OUTSIDE;
        else if (distance < radius) result = INTERSECT;
      }
      return result;
    },
  
    
    /**
     * Jax.Scene.Frustum#cube(corners) -> Jax.Scene.Frustum.INSIDE|Jax.Scene.Frustum.OUTSIDE|Jax.Scene.Frustum.INTERSECT
     * - corners (Array<vec3>): an array of 3D points representing the corners of the cube to be tested
     *
     * Jax.Scene.Frustum#cube(center, width, height, depth) -> Jax.Scene.Frustum.INSIDE|Jax.Scene.Frustum.OUTSIDE|Jax.Scene.Frustum.INTERSECT
     * - center (vec3): a 3D point representing the center of the cube to be tested
     * - width (Number): the width of the cube to be tested
     * - height (Number): the height of the cube to be tested
     * - depth (Number): the depth of the cube to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified cube lies entirely within this frustum;
     * Jax.Scene.Frustum.INTERSECT if the cube lies only partially within this frustum; or
     * Jax.Scene.Frustum.OUTSIDE if the cube lies entirely beyond the boundaries of this frustum.
     **/
    cube: function(corners)
    {
      if (arguments.length == 2) { return varcube(this, arguments[0], arguments[1], arguments[1], arguments[1]); }
      if (arguments.length == 4) { return varcube(this, arguments[0], arguments[1], arguments[2], arguments[3]); }
    
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length > 1) { corners = arguments; }
      var p, c, c2 = 0, i, num_corners = corners.length, plane;
      for (p in this.planes)
      {
        plane = this.planes[p];
        c = 0;
        for (i = 0; i < num_corners; i++)
          if (plane.distance(corners[i]) > 0)
            c++;
        if (c == 0) return OUTSIDE;
        if (c == num_corners) c2++;
      }
    
      return (c2 == 6) ? INSIDE : INTERSECT;
    },
  
    /**
     * Jax.Scene.Frustum#sphereVisible(center, radius) -> Boolean
     * - center (vec3): the center of the sphere to be tested
     * - radius (Number): the radius of the sphere to be tested
     *
     * Returns true if the sphere is entirely or partially within this frustum, false otherwise.
     **/
    sphereVisible: function(center, radius) { return this.sphere.apply(this, arguments) != OUTSIDE; },
    
    /**
     * Jax.Scene.Frustum#pointVisible(point) -> Boolean
     * - point (vec3): the 3D point to be tested
     *
     * Returns true if the point is within this frustum, false otherwise.
     **/
    pointVisible:  function(center)         { return this.point.apply(this, arguments)  != OUTSIDE; },

    /**
    * Jax.Scene.Frustum#cubeVisible(corners) -> Boolean
    * - corners (Array<vec3>): an array of 3D points representing the corners of the cube to be tested
    *
    * Jax.Scene.Frustum#cubeVisible(center, width, height, depth) -> Boolean
    * - center (vec3): a 3D point representing the center of the cube to be tested
    * - width (Number): the width of the cube to be tested
    * - height (Number): the height of the cube to be tested
    * - depth (Number): the depth of the cube to be tested
    * 
     * Returns true if the cube is entirely or partially within this frustum, false otherwise.
     **/
    cubeVisible:   function(corners)        { return this.cube.apply(this, arguments)   != OUTSIDE; },
  
    /**
     * Jax.Scene.Frustum#isValid() -> Boolean
     *
     * Returns true if the frustum has both a projection and a view matrix, false otherwise.
     **/
    isValid: function() { return this.p && this.mv; },
  
    /**
     * Jax.Scene.Frustum#getRenderable() -> Jax.Model
     *
     * Returns a renderable 3D object with a corresponding Jax.Mesh
     * representing this frustum and its orientation within the world. Very
     * useful for debugging or otherwise visualizing the frustum object.
     *
     * The 3D object hooks into this frustum's 'updated' event so that
     * whenever the frustum is updated, the renderable will be, too.
     **/
    getRenderable: function()
    {
      if (this.renderable) return this.renderable;
    
      var renderable = this.renderable = new Jax.Model({mesh: new Jax.Mesh()});
      renderable.upToDate = false;
      var frustum = this;
    
      function addVertices(e, vertices)
      {
        // near quad
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
      
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
    
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);

        // far quad
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
      
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
    
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        // left side
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
      
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
      
        // right side
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
      
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
      }
    
      renderable.mesh.init = function(vertices, colors) {
        this.draw_mode = GL_LINES;
      
        for (var i = 0; i < 24; i++)
        {
          vertices.push(0,0,0);
          colors.push(1,1,0,1);
        }
      };
    
      renderable.update = null;
    
      frustum.addEventListener('updated', function() {
        if (!frustum.isValid()) { return; }
      
        renderable.upToDate = true;
        var buf = renderable.mesh.getVertexBuffer();
        if (!buf) return;
        var vertices = buf.js;
        vertices.clear();
        var e = extents(frustum);//{ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};
      
        addVertices(e, vertices);
      
        buf.refresh();
      });
    
      return renderable;
    }
  });

  /**
   * Jax.Scene.Frustum.INSIDE = Jax.Geometry.Plane.FRONT
   *
   * Special value used to represent an object falling entirely within this frustum.
   **/
  klass.INSIDE = INSIDE;

  /**
   * Jax.Scene.Frustum.OUTSIDE = Jax.Geometry.Plane.BACK
   *
   * Special value used to represent an object falling entirely outside of this frustum.
   **/
  klass.OUTSIDE = OUTSIDE;

  /**
   * Jax.Scene.Frustum.INTERSECT = Jax.Geometry.Plane.INTERSECT
   *
   * Special value used to represent an object falling partially within this frustum, partially outside.
   **/
  klass.INTERSECT = INTERSECT;

  klass.addMethods(Jax.Events.Methods);

  return klass;
})();
