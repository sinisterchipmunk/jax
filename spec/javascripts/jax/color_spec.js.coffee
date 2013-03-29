describe "Jax.Color", ->
  color = null
  beforeEach -> color = new Jax.Color
  
  it "should default to opaque white", ->
    expect(color.toVec4()).toEqualVector [1, 1, 1, 1]

  it 'toString', ->
    expect(color.toString()).toEqual '#ffffffff'
    expect(color.toString(6)).toEqual '#ffffff'
    
  it "shuld parse another color", ->
    color.red = 0
    color.green = 1
    color.blue = 2
    color.alpha = 3
    expect(Jax.Color.parse(color).toVec4()).toEqual [0, 1, 2, 3]
  
  describe "assigned in 8-bit hex", ->
    beforeEach -> color = Jax.Color.parse "#123"
    
    it "should set red properly", ->
      expect(color.red).toEqual 17 / 255
    
    it "should set green properly", ->
      expect(color.green).toEqual 34 / 255
      
    it "should set blue properly", ->
      expect(color.blue).toEqual 51 / 255
      
    it "should set opaque", ->
      expect(color.alpha).toEqual 255 / 255
      
    describe "with alpha", ->
      beforeEach -> color = Jax.Color.parse "#1234"

      it "should set red properly", ->
        expect(color.red).toEqual 17 / 255

      it "should set green properly", ->
        expect(color.green).toEqual 34 / 255

      it "should set blue properly", ->
        expect(color.blue).toEqual 51 / 255

      it "should set alpha properly", ->
        expect(color.alpha).toEqual 68 / 255

  describe "assigned in 16-bit hex", ->
    beforeEach -> color = Jax.Color.parse "#a1b2c3"
    
    it "should set red properly", ->
      expect(color.red).toEqual 161 / 255
    
    it "should set green properly", ->
      expect(color.green).toEqual 178 / 255
      
    it "should set blue properly", ->
      expect(color.blue).toEqual 195 / 255
      
    it "should set alpha properly", ->
      expect(color.alpha).toEqual 255 / 255
  
    describe "with alpha", ->
      beforeEach -> color = Jax.Color.parse "#a1b2c3d4"

      it "should set red properly", ->
        expect(color.red).toEqual 161 / 255

      it "should set green properly", ->
        expect(color.green).toEqual 178 / 255

      it "should set blue properly", ->
        expect(color.blue).toEqual 195 / 255

      it "should set alpha properly", ->
        expect(color.alpha).toEqual 212 / 255
