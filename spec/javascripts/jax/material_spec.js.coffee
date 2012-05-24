describe "Jax.Material", ->
  matr = null
  
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
        class Jax.Material.TestLayer extends Jax.Material.Layer
          @shaderSource: vertex: "// vertex"
        matr.addLayer type: "TestLayer"
      afterEach -> delete Jax.Material.TestLayer
        
      it "should not add undefined code to the vertex shader", ->
        expect(matr.vertex.toString()).not.toMatch /undefined/
        
      it "should not add undefined code to the fragment shader", ->
        expect(matr.fragment.toString()).not.toMatch /undefined/
        
              
    describe "adding a layer", ->
      beforeEach ->
        class Jax.Material.TestLayer extends Jax.Material.Layer
          @shaderSource:
            common: "// common"
            vertex: "// vertex"
            fragment: "// fragment"
        matr.addLayer type: "TestLayer"
      afterEach -> delete Jax.Material.TestLayer
        
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
        Jax.Material.TestLayer.prototype.setup = ->
        spyOn Jax.Material.TestLayer.prototype, 'setup'
        matr.render SPEC_CONTEXT, new Jax.Mesh.Triangles(), new Jax.Model()
        expect(Jax.Material.TestLayer.prototype.setup).toHaveBeenCalled()
      
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
