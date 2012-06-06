# Attempts to implement single-pass wire frame (http://cgg-journal.com/2008-2/06/index.html) in WebGL.
Jax.Controller.create "wire",
  index: ->
    tpmesh = new Jax.Mesh.Teapot
    material = new Jax.Material.Custom
    material.addLayer new Jax.Material.Layer {
      vertex: """
      uniform vec2 WIN_SCALE;
      uniform mat4 MVP;
      attribute vec4 position;
      attribute vec4 p1_3d;
      attribute vec4 p2_3d;
      varying vec3 dist;
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
      """
      fragment: """
      uniform vec4 WIRE_COL;
      uniform vec4 FILL_COL;
      varying vec3 dist;
      void main(void)
      {
         // Undo perspective correction.
      	  vec3 dist_vec = dist * gl_FragCoord.w;
         // Compute the shortest distance to the edge
      	  float d =min(dist_vec[0],min(dist_vec[1],dist_vec[2]));
      	  // Compute line intensity and then fragment color
       	float I = exp2(-2.0*d*d);
       	gl_FragColor = I*WIRE_COL + (1.0 - I)*FILL_COL;
      }
      """
      setVariables: (context, mesh, model, vars, pass) ->
        unless @something
          @something = 1
          # buf2 is given size 4 because we will store the vertex ID (0, 1, 2)
          # in the 4th component. This will improve performance by requiring 1
          # less buffer call.
          buf2 = new Float32Array(mesh.data.indexBuffer.length * 4)
          buf3 = new Float32Array(mesh.data.indexBuffer.length * 3)
          # For the wireframe to work, each index must point to a unique vertex
          # even if it means duplicating some data -- this is because for each
          # vertex A, there are two opposite vertices B and C that must also
          # be sent down, and these opposite vertices will be different at each
          # index.
          _mesh = new Jax.Mesh.Base
            init: (vertices, colors, textures, normals) ->
              for i in [0...mesh.data.indexBuffer.length] by 3
                v1 = mesh.data.indexBuffer[i] * 3
                v2 = mesh.data.indexBuffer[i+1] * 3
                v3 = mesh.data.indexBuffer[i+2] * 3
                c = mesh.data.indexBuffer[i] * 4
                t = mesh.data.indexBuffer[i] * 2
                vertices.push mesh.data.vertexBuffer[v1+0], mesh.data.vertexBuffer[v1+1], mesh.data.vertexBuffer[v1+2]
                normals.push mesh.data.normalBuffer[v1+0], mesh.data.normalBuffer[v1+1], mesh.data.normalBuffer[v1+2]
                colors.push mesh.data.colorBuffer[c], mesh.data.colorBuffer[c+1], mesh.data.colorBuffer[c+2], mesh.data.colorBuffer[c+3]
                textures.push mesh.data.textureCoordsBuffer[t], mesh.data.textureCoordsBuffer[c+1]
                buf2[i*4] = mesh.data.vertexBuffer[v2+0]
                buf2[i*4+1] = mesh.data.vertexBuffer[v2+1]
                buf2[i*4+2] = mesh.data.vertexBuffer[v2+2]
                buf2[i*4+3] = 0
                buf3[i*3] = mesh.data.vertexBuffer[v3+0]
                buf3[i*3+1] = mesh.data.vertexBuffer[v3+1]
                buf3[i*3+2] = mesh.data.vertexBuffer[v3+2]
                vertices.push mesh.data.vertexBuffer[v2+0], mesh.data.vertexBuffer[v2+1], mesh.data.vertexBuffer[v2+2]
                buf2[(i+1)*4] = mesh.data.vertexBuffer[v3+0]
                buf2[(i+1)*4+1] = mesh.data.vertexBuffer[v3+1]
                buf2[(i+1)*4+2] = mesh.data.vertexBuffer[v3+2]
                buf2[(i+1)*4+3] = 1
                buf3[(i+1)*3] = mesh.data.vertexBuffer[v1+0]
                buf3[(i+1)*3+1] = mesh.data.vertexBuffer[v1+1]
                buf3[(i+1)*3+2] = mesh.data.vertexBuffer[v1+2]
                vertices.push mesh.data.vertexBuffer[v3+0], mesh.data.vertexBuffer[v3+1], mesh.data.vertexBuffer[v3+2]
                buf2[(i+2)*4] = mesh.data.vertexBuffer[v1+0]
                buf2[(i+2)*4+1] = mesh.data.vertexBuffer[v1+1]
                buf2[(i+2)*4+2] = mesh.data.vertexBuffer[v1+2]
                buf2[(i+2)*4+3] = 2
                buf3[(i+2)*3] = mesh.data.vertexBuffer[v2+0]
                buf3[(i+2)*3+1] = mesh.data.vertexBuffer[v2+1]
                buf3[(i+2)*3+2] = mesh.data.vertexBuffer[v2+2]
              console.log vertices, buf2
          _mesh.validate() # make sure the mesh data has been built
          # now we will swap the original mesh's data with the newly-built mesh data
          mesh.data = _mesh.data
          # reassign the context to the data so that it knows where to send the vertices
          mesh.data.context = context
          @_p2verts = new Jax.Buffer GL_ARRAY_BUFFER, null, GL_STREAM_DRAW, buf2, 4
          @_p3verts = new Jax.Buffer GL_ARRAY_BUFFER, null, GL_STREAM_DRAW, buf3, 3
        mesh.data.set vars, vertices: 'position'
        vars.set
          WIN_SCALE: [context.canvas.width/2, context.canvas.height/2]
          WIRE_COL: [0.7, 0.7, 0.8, 1]
          FILL_COL: [0, 0, 0, 0]
          MVP: context.matrix_stack.getModelViewProjectionMatrix()
          # be sure to set these AFTER setting the mesh position above, or else
          # the buffers below will bind new GL buffers and mess up the mesh data
          # transfer.
          p1_3d: @_p2verts
          p2_3d: @_p3verts
    }, material
    tpmesh.material = material
    
    @world.ambientColor = [1,1,1,1]
    @world.addObject new Jax.Framerate ema: no
    @world.addObject new Jax.Model 
      position: [0, 0, -3]
      mesh: tpmesh
      update: (tc) -> @camera.rotate tc * 0.001, [1, 0.75, 0.5]
