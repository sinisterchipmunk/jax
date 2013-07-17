describe "Jax.Mesh", ->
  mesh = material = null
  
  describe "a mesh with no colors", ->
    beforeEach ->
      mesh = new Jax.Mesh.Base
        init: (v, c, t, n, i) ->
          v.push 1,1,1
          t.push 0,0
          n.push 1,1,1
          i.push 0
    
    it "should rebuild successfully", ->
      mesh.rebuild()
      mesh.rebuild()

    it 'should expose its vertices', ->
      expect(mesh.vertices).toEqualVector [1,1,1]
      
  it "should initialize from a color as a space-delimited string", ->
    mesh = new Jax.Mesh.Quad color: "1 2 3 4"
    expect(mesh.data.colorBuffer).toIncludeSubset [1, 2, 3, 4]
  
  describe "initialized without normal data", ->
    beforeEach ->
      mesh = new Jax.Mesh.Base(init: (v) -> v.push 1, 1, 1, 2, 2, 2)
      @world.addLight new Jax.Light.Directional # to ensure normals get assigned
    
    it "should recalculate its normals only once when rendered twice", ->
      spyOn mesh, 'recalculateNormals'
      mesh.render @context, new Jax.Model
      mesh.render @context, new Jax.Model
      expect(mesh.recalculateNormals.callCount).toBe 1
      
    it "should set each normal to the vertex direction relative to calculated mesh center", ->
      # calculated center should be 1.5, 1.5, 1.5, making the normals [-1,-1,-1], [1,1,1]
      mesh.render @context, new Jax.Model
      expect(mesh.data.normalBuffer).toEqualVector [vec3.normalize([], [-1,-1,-1])..., vec3.normalize([], [1,1,1])...]
      
    describe "with a submesh", ->
      beforeEach -> mesh.submesh = new Jax.Mesh.Base(init: (v) -> v.push 2, 3, 4)
      
      it "should recalculate normals of its submesh exactly once", ->
        spyOn mesh.submesh, 'recalculateNormals'
        mesh.render @context, new Jax.Model
        mesh.render @context, new Jax.Model
        expect(mesh.submesh.recalculateNormals.callCount).toBe 1
        
  describe "TriangleStrip with more than 65535 vertices", ->
    beforeEach -> mesh = new Jax.Mesh.TriangleStrip(init: (v) -> v.push i for i in [0...(65535*3+9)])

    it "should produce a TriangleStrip sub-mesh", ->
      expect(mesh.submesh).toBeInstanceOf Jax.Mesh.TriangleStrip

    it "should not have more than 65535 vertices", ->
      expect(mesh.data.vertexBuffer.length).not.toBeGreaterThan 65535*3

    it "should not reference higher vertex indices", ->
      for i in mesh.data.indexBuffer
        expect(i).not.toBeGreaterThan 65535

    it "should have a sub-mesh with vertices", ->
      expect(mesh.submesh.data.vertexBuffer.length).not.toEqual 0
      
  describe "Base with more than 65535 vertices", ->
    # Reminder: Jax.Mesh.Base defaults to GL_POINTS so it doesn't need to barf here.
    
    beforeEach -> mesh = new Jax.Mesh.Base(init: (v) -> v.push i for i in [0...(65535*3+9)])

    it "should produce a Base sub-mesh", ->
      expect(mesh.submesh).toBeInstanceOf Jax.Mesh.Base

    it "should not have more than 65535 vertices", ->
      expect(mesh.data.vertexBuffer.length).not.toBeGreaterThan 65535*3

    it "should not reference higher vertex indices", ->
      for i in mesh.data.indexBuffer
        expect(i).not.toBeGreaterThan 65535

    it "should have a sub-mesh with vertices", ->
      expect(mesh.submesh.data.vertexBuffer.length).not.toEqual 0
      

  it "should make its data available immediately after creation", ->
    mesh = new Jax.Mesh.Base(init: (v) -> v.push 1, 1, 1)
    expect(mesh.data.vertexBuffer).toEqualVector [1, 1, 1]
    
  it "should be valid after rebuilding", ->
    mesh = new Jax.Mesh.Quad()
    mesh.rebuild()
    expect(mesh).toBeValid()
    
  it "should always invoke #init during rebuild, even if already valid", ->
    mesh = new Jax.Mesh.Base(init: ->)
    mesh.validate()
    spyOn mesh, 'init'
    mesh.rebuild()
    expect(mesh.init).toHaveBeenCalled()
  
  it "should set 'this' in #render to the mesh instance", ->
    self = null
    class M extends Jax.Mesh.Base
      init: (v) -> v.push(0, 0, 0)
      render: (v) -> self = this
    mesh = new M()
    @world.addObject new Jax.Model mesh: mesh
    @world.render()
    expect(self).toBe mesh
  
  it "should set 'this' in #init to the mesh instance", ->
    self = null
    mesh = new Jax.Mesh.Base init: (v) -> self = this
    mesh.rebuild()
    expect(self).toBe mesh
    
  it "should set arbitrary properties passed to super as instance properties", ->
    mesh = new Jax.Mesh.Base size: 5
    expect(mesh.size).toBe 5
  
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
      expect(mesh.rebuild().data.vertexBuffer.length).toEqual 6
      
    it "should build vertices from an init method supplied by a subclass", ->
      class Klass extends Jax.Mesh.Base
        init: (verts) -> verts.push 1, 2, 3, 4, 5, 6
      expect(new Klass().rebuild().data.vertexBuffer.length).toEqual 6
    
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
        expect(mesh.vertices[0].normal).toEqualVector vec3.normalize([], [1, 2, 3])
        
      xit "should add vertex index to indices", ->
        expect(mesh.indices).toEqualVector [0]
        
      xit "should set vertex index", ->
        expect(mesh.vertices[0].index).toEqual 0
      
      xit "should default texture data to 0", ->
        expect(mesh.vertices[0].texture).toEqualVector [0, 0]
      