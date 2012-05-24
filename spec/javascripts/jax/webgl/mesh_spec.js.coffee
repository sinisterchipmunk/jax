describe "Jax.Mesh2", ->
  mesh = null
  
  describe "Triangles", ->
    beforeEach ->
      mesh = new Jax.Mesh.Triangles init: (v) -> v.push 0, 1, 0, -1, 0, 0, 1, 0, 0
    
    it "should be rendered as GL_TRIANGLES", ->
      mat = new Jax.Material
      mat.render = (context, _mesh, options) ->
        # after all that setup, here's the real test...
        expect(_mesh.draw_mode).toEqual GL_TRIANGLES
      spyOn(mat, 'render').andCallThrough()
      mesh.render "context", "model", mat
      expect(mat.render).toHaveBeenCalled()
  
  describe "Base", ->
    beforeEach -> mesh = new Jax.Mesh.Base()
    
    it "should force rebuild successfully", ->
      mesh.init = (v) -> v.push 0, 1, 2, 3, 4, 5
      mesh.rebuild()
      mesh.rebuild()
      expect(mesh.data.vertexBuffer).toEqualVector [0, 1, 2, 3, 4, 5]
    
    it "should not share data across instances", ->
      m1 = new Jax.Mesh.Base init: (vertices) -> vertices.push 0, 1, 2
      m2 = new Jax.Mesh.Base init: (vertices) -> vertices.push 3, 4, 5
      expect(m1.data.vertexBuffer).not.toEqualVector m2.data.vertexBuffer
    
    it "should assign material from options", ->
      expect(new Jax.Mesh.Base({material: "picking"}).material.name).toEqual 'picking'
    
    it "should fire event listeners when color is changed", ->
      listener = fire: (type) -> expect(type).toEqual 'color_changed'
      spyOn listener, 'fire'
      mesh.addEventListener 'color_changed', listener.fire
      mesh.color = [1, 2, 3, 4]
      expect(spyOn.listener).toHaveBeenCalled
    
    it "should build vertices from an init method supplied during construction", ->
      mesh = new Jax.Mesh.Base init: (verts) ->
        verts.push 1, 2, 3, 4, 5, 6
      expect(mesh.getVertexBuffer().js.length).toEqual 6
      
    it "should build vertices from an init method supplied by a subclass", ->
      class Klass extends Jax.Mesh.Base
        init: (verts) -> verts.push 1, 2, 3, 4, 5, 6
      expect(new Klass().getVertexBuffer().js.length).toEqual 6
    
    xit "should parse vertex colors from string values", ->
      mesh.add_vertex position: [0, 0, 0], color: "#aabbcc"
      expect(mesh.vertices[0].color).toEqualVector [0.666666, 0.733333, 0.8, 1]
      
    xit "should parse mesh colors from string values", ->
      mesh.color = "#aabbcc"
      mesh.add_vertex position: [0, 0, 0], color: [1, 1, 1, 1]
      expect(mesh.vertices[0].blended_color).toEqualVector [0.666666, 0.733333, 0.8, 1]

    describe "with vertices describing a cube", ->
      beforeEach ->
        mesh.init = (vertices) ->
          vertices.push -1,-1, -1,
                        1, -1, -1,
                        1, -1,  1,
                        -1,-1,  1,
                        -1, 1, -1,
                        1,  1, -1,
                        1,  1,  1,
                        -1, 1,  1
        mesh.rebuild()
        
      describe "setting material", ->
        beforeEach -> mesh.material = "default"
        
      describe "rendering", ->
        beforeEach ->
          spyOn Jax.Material.find("default"), "render"
          mesh.render "context", "model"
        
        it "should result in a call to the material's render method", ->
          expect(Jax.Material.find("default").render).toHaveBeenCalledWith "context", 
            mesh,
            "model"        
      
      it "should have width  2",         -> expect(mesh.bounds.width).toEqual  2
      it "should have height 2",         -> expect(mesh.bounds.height).toEqual 2
      it "should have depth  2",         -> expect(mesh.bounds.depth).toEqual  2
      it "should have center at origin", -> expect(mesh.bounds.center).toEqualVector [0, 0, 0]
      it "should find right",            -> expect(mesh.bounds.right[0]).toEqual 1
      it "should find left",             -> expect(mesh.bounds.left[0]).toEqual -1
      it "should find top",              -> expect(mesh.bounds.top[1]).toEqual 1
      it "should find bottom",           -> expect(mesh.bounds.bottom[1]).toEqual -1
      it "should find front",            -> expect(mesh.bounds.front[2]).toEqual 1
      it "should find back",             -> expect(mesh.bounds.back[2]).toEqual -1
      
    describe "with only a single vertex", ->
      beforeEach ->
        mesh.init = (verts) -> verts.push 0, 0, 0
        mesh.rebuild()
      
      it "should blend colors", ->
        mesh.color = [1, 2, 3, 4]
        expect(mesh.data.colorBuffer).toEqualVector [1, 2, 3, 4]
    
      it "should not have 0-value width", ->
        expect(mesh.bounds.width).not.toEqual 0
        
      it "should not have 0-value height", ->
        expect(mesh.bounds.height).not.toEqual 0
        
      it "should not have 0-value depth", ->
        expect(mesh.bounds.depth).not.toEqual 0
    
    describe "add_vertex with overridden defaults", ->
      beforeEach ->
        mesh.add_vertex
          position: [1, 2, 3]
          color: [1, 2, 3, 4]
          texture: [1, 2]
          normal: [1, 2, 3]
      
      xit "should blend colors", ->
        mesh.color = [1, 2, 3, 4]
        expect(mesh.vertices[0].blended_color).toEqualVector [1, 4, 9, 16]

      xit "should override color", ->
        expect(mesh.vertices[0].color).toEqualVector [1, 2, 3, 4]
    
      xit "should override texture", ->
        expect(mesh.vertices[0].texture).toEqualVector [1, 2]
        
      xit "should override normal", ->
        expect(mesh.vertices[0].normal).toEqualVector [1, 2, 3]
  
    describe "add_vertex with only vertex data", ->
      beforeEach -> mesh.add_vertex position: [1, 2, 3]
      
      xit "should default color to white", ->
        expect(mesh.vertices[0].color).toEqualVector [1, 1, 1, 1]
        
      xit "should add vertex data", ->
        expect(mesh.vertices[0].position).toEqualVector [1, 2, 3]
        
      xit "should default normal to vector direction", ->
        expect(mesh.vertices[0].normal).toEqualVector vec3.normalize([1, 2, 3])
        
      xit "should add vertex index to indices", ->
        expect(mesh.indices).toEqualVector [0]
        
      xit "should set vertex index", ->
        expect(mesh.vertices[0].index).toEqual 0
      
      xit "should default texture data to 0", ->
        expect(mesh.vertices[0].texture).toEqualVector [0, 0]
      