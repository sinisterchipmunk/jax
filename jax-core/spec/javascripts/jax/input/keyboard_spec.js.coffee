describe "Jax.Input.Keyboard", ->
  evt = keyboard = canvas = null
  beforeEach ->
    evt = null
    canvas = $ document.createElement('canvas')
    keyboard = new Jax.Input.Keyboard canvas
  
  describe "with a key pressed handler", ->
    beforeEach ->
      keyboard.register {key_pressed: (e) -> evt = e }
  
    it "should process key press events", ->
      canvas.trigger 'keydown'
      expect(evt).not.toBeNull()
  
  describe "with a key released handler", ->
    beforeEach ->
      keyboard.register {key_released: (e) -> evt = e }

    it "should process key press events", ->
      canvas.trigger 'keyup'
      expect(evt).not.toBeNull()

  describe "with a key typed handler", ->
    beforeEach ->
      keyboard.register {key_typed: (e) -> evt = e }

    it "should process key press events", ->
      canvas.trigger 'keypress'
      expect(evt).not.toBeNull()
