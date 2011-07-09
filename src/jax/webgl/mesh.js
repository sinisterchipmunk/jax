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
  //= require "mesh/tangent_space"
  //= require "mesh/support"
  
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
    getVertexBuffer: function() { this.validate(); return this.buffers.vertex_buffer; },
    /**
     * Jax.Mesh#getColorBuffer() -> Jax.ColorBuffer
     **/
    getColorBuffer:  function() { this.validate(); return this.buffers.color_buffer;  },
    /**
     * Jax.Mesh#getIndexBuffer() -> Jax.ElementArrayBuffer
     **/
    getIndexBuffer:  function() { this.validate(); return this.buffers.index_buffer;  },
    /**
     * Jax.Mesh#getNormalBuffer() -> Jax.NormalBuffer
     **/
    getNormalBuffer: function() { this.validate(); return this.buffers.normal_buffer; },
    /**
     * Jax.Mesh#getTextureCoordsBuffer() -> Jax.TextureCoordsBuffer
     **/
    getTextureCoordsBuffer: function() { this.validate(); return this.buffers.texture_coords; },
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
     * Jax.Mesh#validate() -> Jax.Mesh
     *
     * If this mesh is not valid (its #init method hasn't been called or needs to be called again),
     * the mesh will be rebuilt per +Jax.Mesh#rebuild+. This mesh is returned.
     **/
    validate: function() {
      if (!this.isValid()) this.rebuild();
      return this;
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
