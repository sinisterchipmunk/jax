describe "Jax.Material.Legacy", ->
  sim = model = material = null
  
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
      else console.log "Warning: no variable `#{name}` which was set by Jax.Material.Legacy"
    setUniform = (context, variable, value) ->
      name = variable.name
      if sim.state.variables[name] then sim.state.variables[name].value = value
      else console.log "Warning: no variable `#{name}` which was set by Jax.Material.Legacy"
    spyOn(material.shader, 'setUniform').andCallFake setUniform
    spyOn(material.shader, 'setAttribute').andCallFake setAttribute

    SPEC_CONTEXT.prepare()
    model.pushMatrices SPEC_CONTEXT
    return false unless material.preparePass SPEC_CONTEXT, model.mesh, model, pass
    console.log "Run shader with: ", sim.state.variables
    Jax.getGlobal().SPEC_MATERIAL = material # to give console a handle to the most recent failing matr
    Jax.getGlobal().SPEC_SIMULATOR = sim
    sim.start()
  
  beforeEach ->
    material = new Jax.Material.Legacy
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
        color: [0.75, 0, 0, 1]
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
        expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0, 0, 1]
      
  describe "with 1 directional light", ->
    light = null
    beforeEach -> light = @world.addLight new Jax.Light.Directional
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
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0, 0, 1]
    
        describe "on lighting pass", ->
          it "should receive maximum diffuse color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 1, 0, 1]
            
        describe "with camera parallel to light", ->
          beforeEach -> @context.activeCamera.setDirection 0, -1, 0
          
          describe "on lighting pass", ->
            it "should receive maximum diffuse", ->
              run 1
              expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 1, 0, 1]
  
        describe "with camera parallel to light 2", ->
          beforeEach ->
            @context.activeCamera.setDirection -1, 0, 0
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
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0, 0, 1]
  
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
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0, 0, 1]

        describe "on lighting pass", ->
          it "should receive no color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

      describe "with specular but no diffuse", ->
        beforeEach -> material.intensity.diffuse = 0

        describe "on unlit pass", ->
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            run 0
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.01875, 0, 0, 1]

        describe "on lighting pass", ->
          it "should receive no color", ->
            run 1
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

