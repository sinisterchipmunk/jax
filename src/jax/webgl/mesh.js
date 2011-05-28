//= require "core"

/**
 * class Jax.Mesh
 * 
 * Example:
 * 
 *     var mesh = new Jax.Mesh({
 *       init: function(vertices, colors, textureCoords, normals, indices) {
 *          // all of the arguments are arrays. If you don't intend to use one,
 *          // simply don't populate it with data. For instance, if your mesh
 *          // does not use vertex indices, don't add any data to the indices
 *          // array.
 *          
 *          // Colors will default to white if they are not populated.
 *          
 *          // A simple, red, opaque quad:
 *          vertices.push(-1, -1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push(-1,  1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push( 1,  1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push( 1, -1, 0); colors.push(1, 0, 0, 1);
 *       }
 *     });
 *     
 * You can also subclass Mesh directly:
 * 
 *     var Quad = Jax.Class.create(Jax.Mesh, {
 *       init: function(vertices, colors, textureCoords, normals, indices) {
 *          // ...
 *       }
 *     });
 **/
Jax.Mesh = (function() {
  function setColorCoords(self, count, color, coords) {
    var i, j;
    var num_colors = color.length;
    if (num_colors > 4) throw new Error("Color should have at most 4 components");
    for (i = 0; i < count*4; i += 4)
    {
      for (j = 0; j < num_colors; j++)
        coords[i+j] = color[j];
      for (j = num_colors; j < 4; j++) {
        coords[i+j] = 1;
      }
    }
  }
  
  function makeTangentBuffer(self) {
    var normals = self.getNormalBuffer();
    var vertices = self.getVertexBuffer();
    var texcoords = self.getTextureCoordsBuffer();
    var indices = self.getIndexBuffer();
    if (!normals || !vertices || !texcoords) return null;

    var tangentBuffer = self.buffers.tangent_buffer;
    normals = normals.js;
    vertices = vertices.js;
    texcoords = texcoords.js;
    if (indices) indices = indices.js;
    
    var tangents = tangentBuffer ? tangentBuffer.js : [];
    var tan1 = [], tan2 = [], a;
    var v1 = vec3.create(), v2 = vec3.create(), v3 = vec3.create();
    var w1 = [], w2 = [], w3 = [];
    var vertcount;
    var x1, x2, y1, y2, z1, z2, s1, s2, t1, t2, r;
    var dif = [];
    var sdir = vec3.create(), tdir = vec3.create();
    
    function setv(v, a) { v[0] = vertices[a*3];  v[1] = vertices[a*3+1];  v[2] = vertices[a*3+2]; }
    function setw(w, a) { w[0] = texcoords[a*2]; w[1] = texcoords[a*2+1]; }
    function sett1(a) { tan1[a] = tan1[a] || vec3.create(); vec3.add(tan1[a], sdir, tan1[a]); }
    function sett2(a) { tan2[a] = tan2[a] || vec3.create(); vec3.add(tan2[a], tdir, tan2[a]); }
    function findTangentVector(a1, a2, a3) {
      if (indices) { a1 = indices[a1]; a2 = indices[a2]; a3 = indices[a3]; }
      
      setv(v1, a1); setv(v2, a2); setv(v3, a3);
      setw(w1, a1); setw(w2, a2); setw(w3, a3);
      x1 = v2[0] - v1[0]; x2 = v3[0] - v1[0];
      y1 = v2[1] - v1[1]; y2 = v3[1] - v1[1];
      z1 = v2[2] - v1[2]; z2 = v3[2] - v1[2];
      s1 = w2[0] - w1[0]; s2 = w3[0] - w1[0];
      t1 = w2[1] - w1[1]; t2 = w3[1] - w1[1];
      r = 1.0 / (s1 * t2 - s2 * t1);
      
      sdir[0] = (t2 * x1 - t1 * x2) * r; sdir[1] = (t2 * y1 - t1 * y2) * r; sdir[2] = (t2 * z1 - t1 * z2) * r;
      tdir[0] = (s1 * x2 - s2 * x1) * r; tdir[1] = (s1 * y2 - s2 * y1) * r; tdir[2] = (s1 * z2 - s2 * z1) * r;
      if (isNaN(sdir[0]) || isNaN(sdir[1]) || isNaN(sdir[2]) ||
          isNaN(tdir[0]) || isNaN(tdir[1]) || isNaN(tdir[2]) )
      {
        // this only seems to happen when dealing with degenerate triangles
        // ...which seems to be fairly common. So, let's see what happens if
        // we just set the offending vectors to zero.
        sdir[0] = sdir[1] = sdir[2] = tdir[0] = tdir[1] = tdir[2] = 0;
      }
      sett1(a1); sett1(a2); sett1(a3);
      sett2(a1); sett2(a2); sett2(a3);
    }
    
    vertcount = indices ? indices.length : normals.length / 3;
    /* we need to pass the vertices into findTangentVector differently depending on draw mode */
    switch(self.draw_mode) {
      case GL_TRIANGLE_STRIP:
        for (a = 2; a < vertcount; a += 2) {
          findTangentVector(a-2, a-1, a);
          findTangentVector(a, a-1, a+1);
        }
        break;
      case GL_TRIANGLES:
        for (a = 0; a < vertcount; a += 3)
          findTangentVector(a, a+1, a+2);
        break;
      case GL_TRIANGLE_FAN:
        for (a = 2; a < vertcount; a++)
          findTangentVector(0, a-1, a);
        break;
      default:
        throw new Error("Cannot calculate tangent space for draw mode: "+Jax.Util.enumName(self.draw_mode));
    }

    var normal = vec3.create();

    // remove any tangents left over from earlier builds (this should be pretty rare)
    while (tangents.length > vertcount) tangents.pop();

    var b;
    for (b = 0; b < vertcount; b++) {
      
      if (indices) a = indices[b];
      else a = b;
      
      // Gram-Schmidt orthogonalize: (t - n * dot(n, t)).normalize()
      normal[0] = normals[a*3]; normal[1] = normals[a*3+1]; normal[2] = normals[a*3+2];
      vec3.scale(normal, vec3.dot(normal, tan1[a]), dif);
      vec3.subtract(tan1[a], dif, dif);
      vec3.normalize(dif);
          
      tangents[a*4] = dif[0];
      tangents[a*4+1] = dif[1];
      tangents[a*4+2] = dif[2];
      // calc handedness
      tangents[a*4+3] = (vec3.dot(vec3.cross(normal, tan1[a]), tan2[a])) < 0.0 ? -1.0 : 1.0;
    }
    
    if (tangentBuffer)
      self.buffers.tangent_buffer.refresh();
    else
      self.buffers.tangent_buffer = new Jax.NormalBuffer(tangents);
    return self.buffers.tangent_buffer;
  }
  
  function findMaterial(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
      return name_or_instance;
    
    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  }
  
  function calculateBounds(self, vertices) {
    self.bounds = {left:null,right:null,top:null,bottom:null,front:null,back:null,width:null,height:null,depth:null};
    var i, v;
    
    for (i = 0; i < vertices.length; i++)
    {
      // x, i % 3 == 0
      v = vertices[i];
      if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
      if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;
      
      // y, i % 3 == 1
      v = vertices[++i];
      if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
      if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;
      
      // z, i % 3 == 2
      v = vertices[++i];
      if (self.bounds.front == null || v < self.bounds.front)  self.bounds.front  = v;
      if (self.bounds.back  == null || v > self.bounds.back)   self.bounds.back   = v;
    }
    
    self.bounds.width = self.bounds.right - self.bounds.left;
    self.bounds.height= self.bounds.top   - self.bounds.bottom;
    self.bounds.depth = self.bounds.front - self.bounds.back;
  }
  
  function ensureBuilt(self) {
    if (!self.isValid()) self.rebuild();
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      this.buffers = {};

      /**
       * Jax.Mesh#material -> String | Jax.Material
       * This property represents the material that will be used to render this mesh. If
       * it is a string, Jax will find the material with this name in the material registry
       * using:
       * 
       *     Jax.Material.find(...).
       *     
       * If not specified, Jax.Mesh#default_material will be used instead.
       **/

      /**
       * Jax.Mesh#default_material -> String | Jax.Material
       * This property represents the material that will be used to render this mesh if #material
       * isn't given a value and the render options don't override the material. If
       * it is a string, Jax will find the material with this name in the material registry
       * using:
       * 
       *     Jax.Material.find(...).
       *     
       * This property can also be specified as a render option in order to specify a default
       * for a particular pass.
       **/
      this.default_material = "default";

      for (var i in options)
        this[i] = options[i];

      if (!this.draw_mode)
        this.draw_mode = GL_TRIANGLES;
    },
    
    /**
     * Jax.Mesh#setColor(red, green, blue, alpha) -> Jax.Mesh
     * Sets the color of this mesh. This will set the color at each vertex, regardless
     * of the original color of that vertex. The result will be that the entire mesh
     * takes on the specified color (not just a particular vertex).
     **/
    setColor: function(red, green, blue, alpha) {
      var buf = this.getColorBuffer();
      for (var i = 0; i < buf.js.length; i += 4) {
        buf.js[i] = red;
        buf.js[i+1] = green;
        buf.js[i+2] = blue;
        buf.js[i+3] = alpha;
      }
      buf.refresh();
      return this;
    },

    /**
     * Jax.Mesh#dispose() -> undefined
     * Frees the various buffers used by this mesh.
     **/
    dispose: function() {
      while (this.faces && this.faces.length) this.faces.pop();
      while (this.edges && this.edges.length) this.edges.pop();
      for (var i in this.buffers) {
        this.buffers[i].dispose();
        delete this.buffers[i];
      }
      this.built = false;
    },

    /**
     * Jax.Mesh#getFaceVertices(face) -> Array
     * - face (Jax.Core.Face): the face whose vertices you wish to retrieve
     * 
     * Returns the current vertex data for the specified face.
     **/
    getFaceVertices: function(face) {
      return [
                [this.getVertexBuffer().js[face.vertexIndices[0]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[0]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[0]*3+2]
                ],
                [this.getVertexBuffer().js[face.vertexIndices[1]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[1]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[1]*3+2]
                ],
                [this.getVertexBuffer().js[face.vertexIndices[2]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[2]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[2]*3+2]
                ]
             ];
    },
    
    /**
     * Jax.Mesh#getEdgeVertices(edge) -> Array
     * - edge (Jax.Core.Edge): the edge whose vertices you wish to retrieve
     * 
     * Returns the current vertex data for the specified edge.
     **/
    getEdgeVertices: function(edge) {
      return [
                [this.getVertexBuffer().js[edge.vertexIndices[0]*3+0],
                 this.getVertexBuffer().js[edge.vertexIndices[0]*3+1],
                 this.getVertexBuffer().js[edge.vertexIndices[0]*3+2]
                ],
                [this.getVertexBuffer().js[edge.vertexIndices[1]*3+0],
                 this.getVertexBuffer().js[edge.vertexIndices[1]*3+1],
                 this.getVertexBuffer().js[edge.vertexIndices[1]*3+2]
                ]
             ];
    },

    /**
     * Jax.Mesh#render(context[, options]) -> undefined
     * - context (Jax.Context): the Jax context to render this object to
     * - options (Object): a set of custom render options to override the defaults for this Mesh.
     * 
     * Options include:
     *   * *draw_mode* : a GL rendering enum, such as GL_TRIANGLES or GL_LINE_STRIP.
     *   * *material* : an instance of Jax.Material, or the name of a registered Jax material, to override
     *     the material associated with this mesh.
     **/
    render: function(context, options) {
      if (!this.isValid()) this.rebuild();
      options = this.getNormalizedRenderOptions(options);
      options.material.render(context, this, options);
    },
    
    getNormalizedRenderOptions: function(options) {
      var result = Jax.Util.normalizeOptions(options, {
        material: this.material,
        default_material: this.default_material,
        draw_mode: this.draw_mode || GL_TRIANGLES
      });
    
      if (!result.material) result.material = result.default_material;

      result.material = findMaterial(result.material);

      return result;
    },

    /**
     * Jax.Mesh#getVertexBuffer() -> Jax.VertexBuffer
     **/
    getVertexBuffer: function() { ensureBuilt(this); return this.buffers.vertex_buffer; },
    /**
     * Jax.Mesh#getColorBuffer() -> Jax.ColorBuffer
     **/
    getColorBuffer:  function() { ensureBuilt(this); return this.buffers.color_buffer;  },
    /**
     * Jax.Mesh#getIndexBuffer() -> Jax.ElementArrayBuffer
     **/
    getIndexBuffer:  function() { ensureBuilt(this); return this.buffers.index_buffer;  },
    /**
     * Jax.Mesh#getNormalBuffer() -> Jax.NormalBuffer
     **/
    getNormalBuffer: function() { ensureBuilt(this); return this.buffers.normal_buffer; },
    /**
     * Jax.Mesh#getTextureCoordsBuffer() -> Jax.TextureCoordsBuffer
     **/
    getTextureCoordsBuffer: function() { ensureBuilt(this); return this.buffers.texture_coords; },
    /**
     * Jax.Mesh#getTangentBuffer() -> Jax.NormalBuffer
     * Returns tangent normals for each normal in this Mesh. Used for normal / bump mapping.
     **/
    getTangentBuffer: function() {
      if (this.buffers.tangent_buffer) return this.buffers.tangent_buffer;
      return makeTangentBuffer(this);
    },

    /**
     * Jax.Mesh#rebuildTangentBuffer() -> Jax.NormalBuffer
     * Forces an immediate rebuild of the tangent buffer for this Mesh. Use this if you've changed
     * the vertex, normal or texture information to update the tangent vectors. If this step is
     * skipped, you'll notice strange artifacts when using bump mapping (because the tangents will
     * be pointing in the wrong direction).
     **/
    rebuildTangentBuffer: function() {
      return makeTangentBuffer(this);
    },

    /**
     * Jax.Mesh#isValid() -> Boolean
     * 
     * Returns true if this mesh is valid. If the mesh is invalid, it will be rebuilt during the next call to
     * Jax.Mesh#render().
     **/
    isValid: function() { return !!this.built; },

    /**
     * Jax.Mesh#rebuild() -> undefined
     * 
     * Forces Jax to rebuild this mesh immediately. This will dispose of any WebGL buffers
     * and reinitialize them with a new call to this mesh's data init method. Note that this
     * is a very expensive operation and is *usually not* what you want.
     * 
     * If, for instance, you want to update the mesh with new vertex positions (say, for animation)
     * then you'd be much better off doing something like this:
     * 
     *     var vbuf = mesh.getVertexBuffer();
     *     vbuf.js.clear();
     *     for (var i = 0; i < newVertexData.length; i++)
     *       vbuf.push(newVertexData[i]);
     *     vbuf.refresh();
     * 
     **/
    rebuild: function() {
      this.dispose();

      var vertices = [], colors = [], textureCoords = [], normals = [], indices = [];
      if (this.init)
        this.init(vertices, colors, textureCoords, normals, indices);
      
      if (this.color)
        setColorCoords(this, vertices.length / 3, this.color, colors);
      
      if (colors.length == 0) // still no colors?? default to white
        setColorCoords(this, vertices.length / 3, [1,1,1,1], colors);
      
      if (vertices.length > 0)
      {
        this.buffers.vertex_buffer = new Jax.VertexBuffer(vertices);
        calculateBounds(this, vertices);
      }
      
      if (colors.length > 0) this.buffers.color_buffer = new Jax.ColorBuffer(colors);
      if (indices.length> 0) this.buffers.index_buffer = new Jax.ElementArrayBuffer(indices);
      if (normals.length> 0) this.buffers.normal_buffer= new Jax.NormalBuffer(normals);
      if (textureCoords.length > 0) this.buffers.texture_coords = new Jax.TextureCoordsBuffer(textureCoords);
      
      this.built = true;

      if (this.after_initialize) this.after_initialize();
    }
  });
})();
