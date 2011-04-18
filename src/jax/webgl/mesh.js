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
  
  function findMaterial(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
      return name_or_instance;
    
    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  }
  
  function normalizeRenderOptions(self, options) {
    var result = Jax.Util.normalizeOptions(options, {
      material: self.material,
      draw_mode: self.draw_mode || GL_TRIANGLES
    });
    
    result.material = findMaterial(result.material);

    return result;
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
       **/
      this.material = "default";
      
      for (var i in options)
        this[i] = options[i];

      if (!this.draw_mode)
        this.draw_mode = GL_TRIANGLES;
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
      options = normalizeRenderOptions(this, options);
      options.material.render(context, this, options);
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
