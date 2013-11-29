describe "Jax.Material.Surface", ->
  sim = model = material = matr = log = null
  
  describe "multiple instances", ->
    mat2 = null
    beforeEach ->
      matr = new Jax.Material.Surface color: '#f00'
      mat2 = new Jax.Material.Surface color: '#0f0'
      
    it "should not override each others' settings", ->
      color1 = matr.color.diffuse
      color2 = mat2.color.diffuse
      expect(color1.toVec4()).not.toEqualVector color2.toVec4()
  
  describe 'setting variables', ->
    beforeEach -> matr = new Jax.Material.Surface
    
    describe 'color as a value', ->
      beforeEach -> matr.color = '#f00'
      
    describe "color as an object", ->
      beforeEach ->
        matr.color =
          ambient:  '#f00'
          diffuse:  '#0f0'
          specular: '#00f'
      
    describe 'color as a property', ->
      beforeEach ->
        matr.color.ambient  = '#f00'
        matr.color.diffuse  = '#0f0'
        matr.color.specular = '#00f'
      
    describe 'intensity as a number', ->
      beforeEach -> matr.intensity = 5.0
      
    describe "intensity as an object", ->
      beforeEach -> matr.intensity = ambient: 5, diffuse: 6, specular: 7
      
    describe 'intensity as a property', ->
      beforeEach ->
        matr.intensity.ambient  = 5
        matr.intensity.diffuse  = 6
        matr.intensity.specular = 7
