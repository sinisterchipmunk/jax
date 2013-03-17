describe "Jax.Material.Surface", ->
  sim = model = material = matr = log = null
  
  describe "multiple instances", ->
    mat2 = null
    beforeEach ->
      matr = new Jax.Material.Surface color: '#f00'
      mat2 = new Jax.Material.Surface color: '#0f0'
      
    it "should not override each others' settings", ->
      matr.render @context, new Jax.Mesh.Quad, new Jax.Model
      color1 = matr.findLayer(Jax.Material.Layer.LambertDiffuse).color
      mat2.render @context, new Jax.Mesh.Quad, new Jax.Model
      color2 = mat2.findLayer(Jax.Material.Layer.LambertDiffuse).color
      expect(color1.toVec4()).not.toEqualVector color2.toVec4()
  
  describe 'setting variables', ->
    beforeEach -> matr = new Jax.Material.Surface
    
    describe 'color as a value', ->
      beforeEach -> matr.color = '#f00'
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]
        
      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).color.toVec4()).toEqualVector [1, 0, 0, 1]

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).color.toVec4()).toEqualVector [1, 0, 0, 1]

    describe "color as an object", ->
      beforeEach -> matr.color = ambient: '#f00', diffuse: '#0f0', specular: '#00f'
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]

      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).color.toVec4()).toEqualVector [0, 1, 0, 1]

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).color.toVec4()).toEqualVector [0, 0, 1, 1]
        
    describe 'color as a property', ->
      beforeEach ->
        matr.color.ambient  = '#f00'
        matr.color.diffuse  = '#0f0'
        matr.color.specular = '#00f'
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).color.toVec4()).toEqualVector [1, 0, 0, 1]

      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).color.toVec4()).toEqualVector [0, 1, 0, 1]

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).color.toVec4()).toEqualVector [0, 0, 1, 1]

    describe 'intensity as a number', ->
      beforeEach -> matr.intensity = 5.0
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).intensity).toEqual 5
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).intensity).toEqual 5
        
      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).intensity).toEqual 5

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).intensity).toEqual 5

    describe "intensity as an object", ->
      beforeEach -> matr.intensity = ambient: 5, diffuse: 6, specular: 7
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).intensity).toEqual 5
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).intensity).toEqual 5

      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).intensity).toEqual 6

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).intensity).toEqual 7
        
    describe 'intensity as a property', ->
      beforeEach ->
        matr.intensity.ambient  = 5
        matr.intensity.diffuse  = 6
        matr.intensity.specular = 7
      
      it "should delegate to world ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.WorldAmbient).intensity).toEqual 5
        
      it "should delegate to light ambient", ->
        expect(matr.findLayer(Jax.Material.Layer.LightAmbient).intensity).toEqual 5

      it "should delegate to diffuse", ->
        expect(matr.findLayer(Jax.Material.Layer.LambertDiffuse).intensity).toEqual 6

      it "should delegate to specular", ->
        expect(matr.findLayer(Jax.Material.Layer.PhongSpecular).intensity).toEqual 7
  
  run = (pass) ->
    setAttribute = (context, variable, value) ->
      name = variable.name
      if sim.state.variables[name]
        if size = value?.itemSize
          if value?.buffer and not (value instanceof Float32Array) then value = value.buffer
          else if value?.js then value = value.js
          ary = []
          for i in [0...size]
            ary.push value[i]
          value = ary
        sim.state.variables[name].value = value
      else console.log "Warning: no variable `#{name}` which was set by Jax.Material.Surface"
    setUniform = (context, variable, value) ->
      name = variable.name
      if sim.state.variables[name] then sim.state.variables[name].value = value
      else console.log "Warning: no variable `#{name}` which was set by Jax.Material.Surface"
    spyOn(material.shader, 'setUniform').andCallFake setUniform
    spyOn(material.shader, 'setAttribute').andCallFake setAttribute

    SPEC_CONTEXT.prepare()
    model.pushMatrices SPEC_CONTEXT
    material.shader.bind SPEC_CONTEXT
    return false unless material.preparePass SPEC_CONTEXT, model.mesh, model, pass
    console.log "Run shader with: ", sim.state.variables if log
    Jax.getGlobal().SPEC_MATERIAL = material # to give console a handle to the most recent failing matr
    Jax.getGlobal().SPEC_SIMULATOR = sim
    sim.state.scope.definitions.gl_FrontFacing.value = true
    sim.start()
  
  beforeEach ->
    material = new Jax.Material.Surface
      shininess: 60
      color:
        diffuse: [0, 1, 0, 1]
        specular: [1, 0, 0, 1]
      intensity:
        ambient: 0.5
        diffuse: 1
        specular: 1

    model = @world.addObject new Jax.Model
      position: [0.5, -0.5, -5]
      mesh: new Jax.Mesh.Quad(
        color: [0.75, 0.75, 0.75, 1]
        material: material
      )
    model.mesh.validate()
    model.mesh.data.context = @context
    
  beforeEach ->
    sim = new ShaderScript.Simulator
      vertex: material.shader.vertex.toString()
      fragment: material.shader.fragment.toString()

  describe "with no lights", ->
    describe "on unlit pass", ->
      it "should combine vertex color, ambient color, and material ambient intensity", ->
        run 0
        expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0.01875, 0.01875, 1]
      
  describe "with 1 directional light", ->
    light = null
    beforeEach ->
      light = @world.addLight new Jax.Light.Directional
        shadows: false
        direction: [0, -1, 0]
        color:
          ambient:  [0,0,0,1]
          diffuse:  [1,1,1,1]
          specular: [1,1,1,1]

    describe "facing directly toward the surface", ->
      beforeEach -> light.direction = [0, 0, -1]
  
      describe "with diffuse but no specular", ->
        beforeEach -> material.intensity.specular = 0
    
        describe "on unlit pass", ->
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            run 0
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0.01875, 0.01875, 1]
    
        describe "on lighting pass", ->
          describe "with light disabled", ->
            beforeEach -> light.enabled = false

            it "should skip the pass", ->
              expect(run 1).toBeFalse()

          it "should receive maximum diffuse color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0.75, 0, 1]
            
        describe "with camera parallel to light", ->
          beforeEach -> @context.activeCamera.direction = [0, 0, -1]
          
          describe "on lighting pass", ->
            it "should receive maximum diffuse", ->
              run 1
              expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0.75, 0, 1]
  
        describe "with camera parallel to light 2", ->
          beforeEach ->
            @context.activeCamera.direction = [-1, 0, 0]
            light.direction = [-1, 0, 0]

          describe "on lighting pass", ->
            it "should receive no diffuse", -> # because dot(facenorm, lightnorm) == 0
              run 1
              expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

      describe "with specular but no diffuse", ->
        beforeEach -> material.intensity.diffuse = 0
  
        describe "on unlit pass", ->
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            run 0
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0.01875, 0.01875, 1]
  
        describe "on lighting pass", ->
          it "should receive maximum specular color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [1, 0, 0, 1]
      
    describe "facing away from the surface", ->
      beforeEach -> light.direction = [0, 0, 1]
  
      describe "with diffuse but no specular", ->
        beforeEach -> material.intensity.specular = 0
    
        describe "on unlit pass", ->
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            run 0
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0.01875, 0.01875, 1]

        describe "on lighting pass", ->
          it "should receive no color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

      describe "with specular but no diffuse", ->
        beforeEach -> material.intensity.diffuse = 0

        describe "on unlit pass", ->
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            run 0
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0.01875, 0.01875, 1]

        describe "on lighting pass", ->
          it "should receive no color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

