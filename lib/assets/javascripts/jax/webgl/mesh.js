//= require "jax/webgl/core"
//= require_self
//= require "jax/webgl/mesh/tangent_space"
//= require "jax/webgl/mesh/support"
//= require "jax/webgl/mesh/normals"


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
  
  var BUFFERS = {
    /**
     * Jax.Mesh#vertices -> Array
     *
     * A subgroup of Jax.Mesh#vertexData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 3 elements (an X, Y, Z value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     **/
    vertices:['vertexData',3],
    /**
     * Jax.Mesh#normals -> Array
     *
     * A subgroup of Jax.Mesh#normalData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 3 elements (an X, Y, Z value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getNormalBuffer().
     **/
    normals:['normalData',3],
    /**
     * Jax.Mesh#colors -> Array
     *
     * A subgroup of Jax.Mesh#colorData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 4 elements (an R, G, B, A value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getColorBuffer().
     **/
    colors:['colorData',4],
    /**
     * Jax.Mesh#textureCoords -> Array
     *
     * A subgroup of Jax.Mesh#textureCoordsData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 2 elements (a U, V value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getTextureCoordsBuffer().
     **/
    textureCoords:['textureCoordsData',2]
  };
                 
  return Jax.Class.create({
    initialize: function(options) {
      this.buffers = {};
      
      this.bounds = {
        left: 0, right: 0, front: 0, back: 0, top: 0, bottom: 0,
        width: 0, height: 0, depth: 0
      };
      
      this.triangles = [];

      var self = this;
      for (var i in BUFFERS) {
        Object.defineProperty(self, i, (function() {
          var j = "_"+i, k = BUFFERS[i];
          return {
            configurable: true,
            enumerable: true,
            get: function() {
              if (!self[j])                                   // if (!self._vertices)
                self[j] = self.validate()[k[0]].group(k[1]);  //   self._vertices = self.validate().vertexData.group(3);
              return self[j];                                 // return self._vertices;
            },
            // set: function(v) { }
          };
        })());
      }
      
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

      if (this.draw_mode == undefined)
        this.draw_mode = GL_TRIANGLES;
    },
    
    /**
     * Jax.Mesh#getBounds() -> Object
     *
     * Returns a generic object containing the following properties describing
     * an axis-aligned bounding box (AABB):
     *
     * <table>
     *   <tr><th>left, right</th><td>X-axis coordinates of the left-most and right-most vertices</td></tr>
     *   <tr><th>top, bottom</th><td>Y-axis coordinates of the top-most and bottom-most vertices</td></tr>
     *   <tr><th>front, back<sup>1</sup></th><td>Z-axis coordinates of the closest and furthest vertices</td></tr>
     *   <tr><th>width, height, depth</th><td>non-negative dimensions of the cube</td></tr>
     * </table>
     *
     * <sup>1</sup> as with most units in WebGL, the front is the greatest value, while the back
     * is the lowest.
     *
     * If the mesh has not been built yet (e.g. +Jax.Mesh#isValid+ returns false), these properties will
     * all be zero, or they will be whatever their previous values were if the mesh has been invalidated.
     *
     * These properties will also all be zero if the mesh has been built but has no vertices.
     **/
    getBounds: function() { return this.bounds; },
    
    /**
     * Jax.Mesh#getTriangles() -> Array<Jax.Geometry.Triangle>
     *
     * Returns an array of +Jax.Geometry.Triangle+ built from the vertices in this mesh.
     * If the draw mode for the mesh is not one of +GL_TRIANGLES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN+,
     * then the array will be empty.
     *
     * Also, it is up to the +init+ method to make sure that the number of vertices produced
     * matches the selected draw mode. If, for instance, the draw mode is +GL_TRIANGLES+ but
     * the number of vertices is not divisible by 3, this method will simply return an incomplete
     * or empty triangle array rather than raise an error.
     **/
    getTriangles: function() {
      this.validate();
      if (this.triangles.length == 0 && this.vertices.length != 0) this.buildTriangles();
      return this.triangles;
    },
    
    /**
     * Jax.Mesh#setColor(red, green, blue, alpha) -> Jax.Mesh
     * Sets the color of this mesh. This will set the color at each vertex, regardless
     * of the original color of that vertex. The result will be that the entire mesh
     * takes on the specified color (not just a particular vertex).
     **/
    setColor: function(red, green, blue, alpha) {
      var colorBuffer = this.getColorBuffer();
      
      for (var i = 0; i < this.colors.length; i++) {
        if (arguments.length == 4) {
          this.colors[i].array[0] = red;
          this.colors[i].array[1] = green;
          this.colors[i].array[2] = blue;
          this.colors[i].array[3] = alpha;
        } else {
          for (var j = 0; j < 4; j++) {
            this.colors[i].array[j] = arguments[0][j];
          }
        }
      }

      colorBuffer.refresh();
      return this;
    },

    /**
     * Jax.Mesh#dispose() -> undefined
     * Frees the various WebGL buffers used by this mesh.
     **/
    dispose: function() {
      for (var i in this.buffers)
        this.buffers[i].dispose();
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
        draw_mode: this.draw_mode == undefined ? GL_TRIANGLES : this.draw_mode
      });
    
      if (!result.material) result.material = result.default_material;

      result.material = Jax.Util.findMaterial(result.material);

      return result;
    },

    /**
     * Jax.Mesh#getVertexBuffer() -> Jax.DataBuffer
     **/
    getVertexBuffer: function() {
      this.validate();
      if (this.buffers.vertex_buffer.length == 0) return null;
      return this.buffers.vertex_buffer;
    },
    
    /**
     * Jax.Mesh#getColorBuffer() -> Jax.DataBuffer
     **/
    getColorBuffer:  function() {
      this.validate();
      if (this.buffers.color_buffer.length == 0) return null;
      return this.buffers.color_buffer;
    },
    
    /**
     * Jax.Mesh#getIndexBuffer() -> Jax.DataBuffer
     **/
    getIndexBuffer:  function() {
      this.validate();
      if (this.buffers.index_buffer.length == 0) return null;
      return this.buffers.index_buffer;
    },
    
    /**
     * Jax.Mesh#getNormalBuffer() -> Jax.DataBuffer
     **/
    getNormalBuffer: function() {
      this.validate();
      if (this.buffers.normal_buffer.length == 0 && this.buffers.vertex_buffer.length > 0)
        this.recalculateNormals();
      if (this.buffers.normal_buffer.length == 0) return null;
      return this.buffers.normal_buffer;
    },
    
    /**
     * Jax.Mesh#getTextureCoordsBuffer() -> Jax.DataBuffer
     **/
    getTextureCoordsBuffer: function() {
      this.validate();
      if (this.buffers.texture_coords.length == 0) return null;
      return this.buffers.texture_coords;
    },
    
    /**
     * Jax.Mesh#getTangentBuffer() -> Jax.DataBuffer
     * Returns tangent normals for each normal in this Mesh. Used for normal / bump mapping.
     **/
    getTangentBuffer: function() {
      if (!this.buffers.tangent_buffer) return this.rebuildTangentBuffer();
      if (this.buffers.tangent_buffer.length == 0) return null;
      return this.buffers.tangent_buffer;
    },

    /**
     * Jax.Mesh#rebuildTangentBuffer() -> Jax.NormalBuffer
     * Forces an immediate rebuild of the tangent buffer for this Mesh. Use this if you've changed
     * the vertex, normal or texture information to update the tangent vectors. If this step is
     * skipped, you'll notice strange artifacts when using bump mapping (because the tangents will
     * be pointing in the wrong direction).
     **/
    rebuildTangentBuffer: function() {
      return this.makeTangentBuffer();
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
     * Jax.Mesh#recalculateNormals() -> Jax.Mesh
     *
     * Recalculates all vertex normals based on the vertices themselves (and vertex indices, if present),
     * replacing all current values. This is a very expensive operation and should be avoided if at all
     * possible by populating the normals directly within this mesh's +init+ method.
     **/
    recalculateNormals: function() {
      this.calculateNormals();
    },

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
      
      // we are about to recalculate vertices, that means triangles will (maybe) be inaccurate
      while (this.triangles.length > 0)
        this.triangles.pop();

      var vertices = [], colors = [], textureCoords = [], normals = [], indices = [];
      if (this.init)
        this.init(vertices, colors, textureCoords, normals, indices);
      
      this.built = true;
      
      // mesh builder didn't set colors...default to this.color || white.
      if (colors.length == 0 || this.color) {
        if (!this.color) this.color = [1,1,1,1];
        for (var i = 0; i < vertices.length / 3; i++) {
          for (var j = 0; j < 4; j++)
            colors[i*4+j] = this.color[j];
        }
      }

      if (this.dataRegion) {
        // we don'y simply call data.set(vertices) because the data count may
        // have changed. Remapping will reallocate memory as needed.
        this.dataRegion.remap(this.vertexData,        vertices);
        this.dataRegion.remap(this.colorData,         colors);
        this.dataRegion.remap(this.textureCoordsData, textureCoords);
        this.dataRegion.remap(this.normalData,        normals);
        this.dataRegion.remap(this.indices,           indices);
      } else {
        // it's faster to preallocate a known number of bytes than it is to
        // let the data region figure it out incrementally. We can be conservative here.
        // If the number is too low, dataRegion will adapt.
        this.dataRegion = new Jax.DataRegion(
          (vertices.length+colors.length+textureCoords.length+normals.length) * Float32Array.BYTES_PER_ELEMENT +
          indices.length * Uint16Array.BYTES_PER_ELEMENT
        );
        
        this.vertexData        = this.dataRegion.map(Float32Array, vertices);
        this.colorData         = this.dataRegion.map(Float32Array, colors);
        this.textureCoordsData = this.dataRegion.map(Float32Array, textureCoords);
        this.normalData        = this.dataRegion.map(Float32Array, normals);
        this.indices           = this.dataRegion.map(Uint16Array,  indices);
      }
      
      this._vertices = null;
      this._colors = null;
      this._textureCoords = null;
      this._normals = null;
      
      this.calculateBounds(vertices);

      this.buffers.vertex_buffer  = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.vertexData, 3);
      this.buffers.color_buffer   = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.colorData, 4);
      this.buffers.normal_buffer  = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.normalData, 3);
      this.buffers.texture_coords = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.textureCoordsData, 2);
      this.buffers.index_buffer   = new Jax.DataBuffer(GL_ELEMENT_ARRAY_BUFFER, this.indices);

      if (this.after_initialize) this.after_initialize();
    }
  });
})();
