describe "Jax.Material", ->
  matr = null
  guid = Jax.guid
  
  afterEach ->
    Jax.guid = guid
    delete Jax.Material.Layer.TestLayer
  
  describe "with an instance layer with un-shared properties", ->
    TestMat = null
    beforeEach ->
      spyOn(Jax, 'guid').andReturn 0
      class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
        @shaderSource: { fragment: 'uniform float time; void main(void) { float x = time; }' }
        setVariables: (c, m, o, v, p) -> v.time = 1.5
      TestMat = class TestMat extends Jax.Material
        constructor: -> super(); @addLayer type: 'TestLayer'
        
    afterEach ->
      delete Jax.Material.Layer.TestLayer
        
    it 'should set the property appropriately', ->
      mat = new TestMat()
      mat.render(@context, new Jax.Mesh.Quad, new Jax.Model)
      expect(mat.assigns["time0"]).toEqual 1.5
  
  describe "with class-wide layers", ->
    TestMat = null
    beforeEach ->
      fakeGUID = 0
      spyOn(Jax, 'guid').andCallFake -> fakeGUID++
      TestMat = class TestMat extends Jax.Material
        @addLayer type: "Position"
    
    it "should share shaders between instances", ->
      expect(new TestMat().shader).toBe new TestMat().shader
      
    it "should not taint Jax.Material", ->
      expect(Jax.Material.getLayers()).toBeEmpty()
      
    it "should not add layers more than once", ->
      expect(new TestMat().layers.length).toEqual 1
      expect(new TestMat().layers.length).toEqual 1
      
    describe "after localization", ->
      mat = null
      beforeEach ->
        mat = new TestMat()
        mat.localizeShader()
      
      it 'should allow layers to be added', ->
        str = mat.shader.fragment.toString()
        mat.addLayer type: 'VertexColor'
        mat.addLayer type: 'VertexColor'
        expect(mat.shader.fragment.toString()).not.toEqual str
  
  it "should not reuse attribute arrays from different objects", ->
    # when for example obj A binds its normals, but obj B does not,
    # then it should not try to create a vertex attrib pointer using
    # the normal buffer length and offset from obj A.
    # This is a case of tainted state.
    matr = new Jax.Material
    obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(material: matr)
    obj2 = new Jax.Model mesh: new Jax.Mesh.Quad(material: matr)
    matr.addLayer new Jax.Material.Layer {
      vertex: "shared attribute vec3 NORMAL, VERT; void main(void) { gl_Position = vec4(VERT * NORMAL, 1.0); }"
      setVariables: (context, mesh, model, vars, pass) ->
        if model is obj1 then mesh.data.set vars, normals: 'NORMAL'
        mesh.data.set vars, vertices: 'VERT'
    }, matr

    normalVariable = matr.shader.variables.attributes['NORMAL']

    obj1.render SPEC_CONTEXT, matr
    spyOn(matr.shader, 'setAttribute').andCallThrough()
    obj2.render SPEC_CONTEXT, matr
    expect(matr.shader.setAttribute).not.toHaveBeenCalledWith \
      SPEC_CONTEXT, normalVariable, obj1.mesh.data.normalWrapper
  
  describe "with layers requiring multiple passes", ->
    layer1 = layer2 = layer1_order = layer2_order = null
    
    beforeEach ->
      [layer1_order, layer2_order] = [[], []]
      class Jax.Material.Layer.TestLayer1 extends Jax.Material.Layer
        numPasses: -> 2
      class Jax.Material.Layer.TestLayer2 extends Jax.Material.Layer
        numPasses: -> 4
      matr = new Jax.Material
      matr.addLayer layer1 = new Jax.Material.Layer.TestLayer1 {}, matr
      matr.addLayer layer2 = new Jax.Material.Layer.TestLayer2 {}, matr
      
    it "should render in the expected order", ->
      layer1.setVariables = (context, mesh, model, vars, pass) -> layer1_order.push pass
      layer2.setVariables = (context, mesh, model, vars, pass) -> layer2_order.push pass
      matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles, new Jax.Model
      expect(layer1_order).toEqualVector [0, 1, 2, 3]
      expect(layer2_order).toEqualVector [0, 1, 2, 3]
      
  it "should skip passes where setVariables returns false", ->
    class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
      setVariables: (context, mesh, model, vars, pass) -> return false
    matr = new Jax.Material
    matr.addLayer new Jax.Material.Layer.TestLayer {}, matr
    spyOn matr, 'drawBuffers'
    matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles, new Jax.Model
    expect(matr.drawBuffers).not.toHaveBeenCalled()
    
  it "should not skip passes where setVariables returns undefined", ->
    class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
      setVariables: (context, mesh, model, vars, pass) -> return undefined
    matr = new Jax.Material
    matr.addLayer new Jax.Material.Layer.TestLayer {}, matr
    spyOn matr, 'drawBuffers'
    matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles, new Jax.Model
    expect(matr.drawBuffers).toHaveBeenCalled()
  
  it "should not skip passes where setVariables returns undefined", ->
    class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
      setVariables: (context, mesh, model, vars, pass) -> return null
    matr = new Jax.Material
    matr.addLayer new Jax.Material.Layer.TestLayer {}, matr
    spyOn matr, 'drawBuffers'
    matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles, new Jax.Model
    expect(matr.drawBuffers).toHaveBeenCalled()

  it "should not skip passes where setVariables is not defined", ->
    class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
    matr = new Jax.Material
    matr.addLayer new Jax.Material.Layer.TestLayer {}, matr
    spyOn matr, 'drawBuffers'
    matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles, new Jax.Model
    expect(matr.drawBuffers).toHaveBeenCalled()

  describe "instance", ->
    beforeEach -> matr = new Jax.Material
    
    it "should produce basic vertex shader source", ->
      expect(matr.vertex.toString()).toMatch /void main/
    
    it "should produce basic fragment shader source", ->
      expect(matr.fragment.toString()).toMatch /void main/
  
    it "should assign all options", ->
      expect(new Jax.Material(version: "2.1.0").version).toEqual '2.1.0'
    
    it "should clone options so that originals can't be tainted", ->
      options = array: []
      expect(new Jax.Material(options).array).not.toBe options.array
      
    describe "adding a layer with only vertex code", ->
      beforeEach ->
        class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
          @shaderSource: vertex: "// vertex"
        matr.addLayer type: "TestLayer"
      afterEach -> delete Jax.Material.Layer.TestLayer
        
      it "should not add undefined code to the vertex shader", ->
        expect(matr.vertex.toString()).not.toMatch /undefined/
        
      it "should not add undefined code to the fragment shader", ->
        expect(matr.fragment.toString()).not.toMatch /undefined/
        
              
    describe "adding a layer", ->
      beforeEach ->
        class Jax.Material.Layer.TestLayer extends Jax.Material.Layer
          @shaderSource:
            common: "// common"
            vertex: "// vertex"
            fragment: "// fragment"
        matr.addLayer type: "TestLayer"
      afterEach -> delete Jax.Material.Layer.TestLayer
        
      it "should add the common code to the vertex shader", ->
        expect(matr.vertex.toString()).toMatch /common/

      it "should add the vertex code to the vertex shader", ->
        expect(matr.vertex.toString()).toMatch /vertex/

      it "should not add the fragment code to the vertex shader", ->
        expect(matr.vertex.toString()).not.toMatch /fragment/

      it "should add the common code to the fragment shader", ->
        expect(matr.fragment.toString()).toMatch /common/

      it "should not add the vertex code to the fragment shader", ->
        expect(matr.fragment.toString()).not.toMatch /vertex/

      it "should add the fragment code to the vertex shader", ->
        expect(matr.fragment.toString()).toMatch /fragment/
      
      it "should call `setup` on the layer when rendering", ->
        Jax.Material.Layer.TestLayer.prototype.setup = ->
        spyOn Jax.Material.Layer.TestLayer.prototype, 'setup'
        matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles(), new Jax.Model()
        expect(Jax.Material.Layer.TestLayer.prototype.setup).toHaveBeenCalled()
      
      it "should bind the shader", ->
        spyOn matr.shader, 'bind'
        matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles(), new Jax.Model()
        expect(matr.shader.bind).toHaveBeenCalled()
        

  describe "class method", ->
    describe "find", ->
      afterEach ->
        # Jax.Material.clearResources()
        delete Jax.Material.T
      
      it "should raise an error when not found", ->
        expect(-> Jax.Material.find "guaranteed to be missing, I hope!").toThrow("Material 'guaranteed to be missing, I hope!' could not be found!")
        
      it "should return the same instance in multiple calls", ->
        Jax.Material.addResources _material_test: {}
        expect(Jax.Material.find "_material_test").toBe Jax.Material.find("_material_test")
  
      it "should return an instance of Jax.Material", ->
        Jax.Material.addResources _material_test: {}
        expect(Jax.Material.find "_material_test").toBeInstanceOf Jax.Material
