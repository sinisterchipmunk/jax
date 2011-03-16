//= require "../../geometry"

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
    initialize: function(modelview, projection) {
      this.listeners = {update:[]};
      this.callbacks = this.listeners;
      this.planes = {};
      for (var i = 0; i < 6; i++) this.planes[i] = new Jax.Geometry.Plane();
      this.setMatrices(modelview, projection);
    },
  
    update: function() { if (this.mv && this.p) { extractFrustum(this); this.fireListeners('update'); } },
    setModelviewMatrix: function(mv) { this.setMatrices(mv, this.p); },
    setProjectionMatrix: function(p) { this.setMatrices(this.mv, p); },
  
    setMatrices: function(mv, p) {
      this.mv = mv;
      this.p  = p;
      this.update();
    },
  
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
  
    /* Arguments can either be an array of indices, or a position array [x,y,z] followed by width, height and depth.
        Examples:
          var cube = new Cube(...);
          frustum.cube(cube.getCorners());
          frustub.cube(cube.orientation.getPosition(), 1);
          frustub.cube(cube.orientation.getPosition(), 1, 2, 3);
     */
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
  
    addUpdateListener: function(callback) { this.listeners.update.push(callback); },
    sphereVisible: function(center, radius) { return this.sphere.apply(this, arguments) != OUTSIDE; },
    pointVisible:  function(center)         { return this.point.apply(this, arguments)  != OUTSIDE; },
    cubeVisible:   function(corners)        { return this.cube.apply(this, arguments)   != OUTSIDE; },
  
    fireListeners: function(name) {
      for (var i = 0; i < this.listeners[name].length; i++)
        this.listeners[name][i]();
    },

    isValid: function() { return this.p && this.mv; },
  
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
    
      frustum.addUpdateListener(function() {
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

  klass.INSIDE = INSIDE;
  klass.OUTSIDE = OUTSIDE;
  klass.INTERSECT = INTERSECT;

  return klass;
})();