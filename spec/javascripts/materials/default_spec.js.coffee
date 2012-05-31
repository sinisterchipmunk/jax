describe "Material: default", ->
  sim = world = null
  
  set = (obj) -> (sim.state.variables[name].value = value) for name, value of obj
  
  beforeEach ->
    world = SPEC_CONTEXT.world
    world.addObject new Jax.Model position: [0, 0, -5], mesh: new Jax.Mesh.Sphere
    
  describe "fragment shader", ->
    beforeEach ->
      sim = new ShaderScript.Simulator fragment: Jax.Material.find("default").shader.fragment.toString()
    
    beforeEach ->
      set
        EyeSpaceLightDirection: [0, 0, -1]
        EyeSpaceLightPosition: [0, 0, 10]
        LightDiffuseColor: [1, 1, 1, 1]
        LightSpecularColor: [1, 1, 1, 1]
        MaterialAmbientIntensity: 0.5
        MaterialDiffuseIntensity: 1
        MaterialSpecularIntensity: 1
        MaterialDiffuseColor: [0, 1, 0, 1]
        MaterialSpecularColor: [1, 0, 0, 1]
        MaterialShininess: 60
        PASS: 0
        WorldAmbientColor: [0.5, 0.5, 0.5, 1]
        vColor: [0.75, 0, 0, 1]
        vEyeSpaceSurfaceNormal: [0, 0, 1]
        vEyeSpaceSurfacePosition: [0, 0, -1]
      
    describe "with no lights", ->
      describe "on ambient pass", ->
        beforeEach -> set PASS: 0
          
        it "should combine vertex color, ambient color, and material ambient intensity", ->
          sim.start()
          expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.1875, 0, 0, 1]
          
    describe "with 1 directional light facing directly toward the surface", ->
      beforeEach ->
        set EyeSpaceLightDirection: [0, 0, -1]
      
      describe "with diffuse but no specular", ->
        beforeEach -> set MaterialSpecularIntensity: 0
        
        describe "on ambient pass", ->
          beforeEach -> set PASS: 0
          
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.1875, 0, 0, 1]
        
        describe "on lighting pass", ->
          beforeEach -> set PASS: 1
        
          it "should receive maximum diffuse color", ->
            sim.start()
            console.log sim.state
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 1, 0, 1]
      
      describe "with specular but no diffuse", ->
        beforeEach -> set MaterialDiffuseIntensity: 0
        
        describe "on ambient pass", ->
          beforeEach -> set PASS: 0
          
          it "should combine vertex color, ambient color, and material ambient intensity", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.1875, 0, 0, 1]
        
        describe "on lighting pass", ->
          beforeEach -> set PASS: 1
        
          it "should receive maximum specular color", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [1, 0, 0, 1]
            
    describe "with 1 directional light facing away from the surface", ->
      beforeEach ->
        set EyeSpaceLightDirection: [0, 0, 1]
      
      describe "with diffuse but no specular", ->
        beforeEach -> set MaterialSpecularIntensity: 0
        
        describe "on ambient pass", ->
          beforeEach -> set PASS: 0

          it "should combine vertex color, ambient color, and material ambient intensity", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.1875, 0, 0, 1]

        describe "on lighting pass", ->
          beforeEach -> set PASS: 1

          it "should receive no color", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

      describe "with specular but no diffuse", ->
        beforeEach -> set MaterialDiffuseIntensity: 0

        describe "on ambient pass", ->
          beforeEach -> set PASS: 0

          it "should combine vertex color, ambient color, and material ambient intensity", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0.1875, 0, 0, 1]

        describe "on lighting pass", ->
          beforeEach -> set PASS: 1

          it "should receive no color", ->
            sim.start()
            expect(sim.state.variables.gl_FragColor.value).toEqualVector [0, 0, 0, 1]

