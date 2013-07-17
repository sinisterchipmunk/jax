describe "Jax.Input.Keyboard", ->
  evt = keyboard = null
  beforeEach ->
    evt = null
    keyboard = new Jax.Input.Keyboard document.createElement('canvas')
  
  describe "with a key pressed handler", ->
    beforeEach ->
      keyboard.listen 'press', (e) -> evt = e
  
    it "should process key press events", ->
      keyboard.trigger 'keydown'
      expect(evt).not.toBeNull()
  
  describe "with a key released handler", ->
    beforeEach ->
      keyboard.listen 'release', (e) -> evt = e

    it "should process key press events", ->
      keyboard.trigger 'keyup'
      expect(evt).not.toBeNull()

  describe "with a key typed handler", ->
    beforeEach ->
      keyboard.listen 'type', (e) -> evt = e

    it "should process key press events", ->
      keyboard.trigger 'keypress'
      expect(evt).not.toBeNull()
