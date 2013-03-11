describe "Jax.Input.Mouse", ->
  evt = mouse = null
  beforeEach ->
    evt = null
    mouse = new Jax.Input.Mouse document.createElement('canvas')
  
  it "should not initially register any handlers", ->
    spyOn @context.canvas, 'addEventListener'
    new Jax.Input.Mouse @context.canvas
    expect(@context.canvas.addEventListener).not.toHaveBeenCalled()
    
  describe "with a scaled canvas", ->
    target = voffset = LEFT = TOP = null
    beforeEach ->
      LEFT = 202
      TOP = 252
      target = document.createElement('canvas')
      target.width = 150
      target.height = 100
      target.style.width = '300px'
      target.style.height = '200px'
      target.style.position = 'absolute'
      target.style.left = '202px'
      target.style.top = '252px'
      document.body.appendChild target
      mouse = new Jax.Input.Mouse target
      window.scrollTo 0, 0
    afterEach ->
      document.body.removeChild target
          
    it "should create `x` and `y` properties local to the canvas", ->
      mouse.listen 'move', (e) -> evt = e
      mouse.processEvent 'mousemove',
        clientX: LEFT
        clientY: TOP
        target: target
      expect(evt.x).toEqual 0
      expect(evt.y).toEqual 0
      
    it "should track differences in `x` and `y`", ->
      mouse.listen 'move', (e) -> evt = e
      mouse.processEvent 'mousemove',
        clientX: LEFT + 3
        clientY: TOP  + 3
        target: target
      mouse.processEvent 'mousemove',
        clientX: LEFT + 10
        clientY: TOP  + 1
        target: target
      expect(evt.diffx).toBeGreaterThan 0
      expect(evt.diffy).toBeLessThan 0

    it "should massage mouse position into real framebuffer coordinates", ->
      mouse.listen 'move', (e) -> evt = e
      mouse.processEvent 'mousemove',
        clientX: LEFT + 300
        clientY: TOP  + 300
        target: target
      expect(evt.x).toEqual 150
      expect(evt.y).toEqual 150
    
  describe "with a mouse drag handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.listen 'drag', (e) -> events.push e
      
    it "should stop dragging when the mouse leaves the canvas", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mousemove'
      mouse.trigger 'mouseout'
      mouse.trigger 'mouseover'
      mouse.trigger 'mousemove'
      expect(events.length).toEqual 1
      
    it "should stop dragging when the mouse is clicked", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      mouse.trigger 'click'
      mouse.trigger 'mousemove'
      expect(events).toBeEmpty()

    it "should not fire drag event for mouse moves while button is depressed", ->
      mouse.trigger 'mousemove'
      mouse.trigger 'mousemove'
      mouse.trigger 'mousemove'
      expect(events.length).toEqual 0
      
    it "should fire drag event for each mouse move while button is pressed", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mousemove'
      mouse.trigger 'mousemove'
      mouse.trigger 'mousemove'
      expect(events.length).toEqual 3
      
    it "should stop firing drag events after the mouse has been depressed", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mousemove'
      mouse.trigger 'mouseup'
      mouse.trigger 'mousemove'
      mouse.trigger 'mousemove'
      expect(events.length).toEqual 1
    
  describe "with a mouse over handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.listen 'over', (e) -> events.push e
    
    it "should fire the over event as many times as it occurs in DOM", ->
      mouse.trigger 'mouseover'
      mouse.trigger 'mouseover'
      mouse.trigger 'mouseover'
      expect(events.length).toEqual 3
      
  describe "with a mouse exit handler", ->
    beforeEach ->
      mouse.listen 'exit', (e) -> evt = e

    it "should fire the exit event when it is received", ->
      mouse.trigger 'mouseout'
      expect(evt).not.toBeNull()

  describe "with a mouse entered handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.listen 'enter', (e) -> events.push e
    
    it "should fire the entered event only once for a set of over events", ->
      mouse.trigger 'mouseover'
      mouse.trigger 'mouseover'
      mouse.trigger 'mouseover'
      expect(events.length).toEqual 1
      
    it "should fire the entered event again if the mouse exits and then re-enters", ->
      mouse.trigger 'mouseover'
      mouse.trigger 'mouseout'
      mouse.trigger 'mouseover'
      expect(events.length).toEqual 2
    
  describe "with a mouse press handler", ->
    beforeEach -> mouse.listen 'press', (e) -> evt = e
    
    it "should fire when the mouse is down", ->
      mouse.trigger 'mousedown'
      expect(evt).not.toBeNull()
      
    it "should not fire when the mouse is released", ->
      mouse.trigger 'mouseup'
      expect(evt).toBeNull()
      
  describe "with a mouse release handler", ->
    beforeEach -> mouse.listen 'release', (e) -> evt = e
    
    it "should fire when the mouse is up", ->
      mouse.trigger 'mouseup'
      expect(evt).not.toBeNull()
  
  describe "with a mouse click handler", ->
    beforeEach -> mouse.listen 'click', (e) -> evt = e

    describe "calling 'trigger' with 'click'", ->
      ###
      We do our own internal click detection because standard DOM click 
      detection produces some undesirable effects. To make the API for
      programmatically triggering events more intuitive, we'll also perform
      some translation from 'click' into the 'mousedown'/'mouseup' 
      combination that Jax is programmed to handle. This way, people who
      need to programmatically trigger events on a Jax context hopefully
      won't have to worry about this translation for themselves.
      ###
      beforeEach ->
        mouse.trigger 'click'

      it "should produce a single click", ->
        expect(evt.clickCount).toEqual 1
    
    it "should not fire if the mouse moves between clicks", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mousemove'
      mouse.trigger 'mouseup'
      expect(evt).toBeNull()
    
    it "should fire when the mouse is down and up in rapid succession", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      expect(evt).not.toBeNull()
      
    it "should not fire if the mouse hasn't been released", ->
      mouse.trigger 'mousedown'
      expect(evt).toBeNull()
      
    it "should not fire when the mouse is down and up slowly", ->
      mouse.trigger 'mousedown'
      # sleep for an arbitrarily high duration for less brittle tests
      mouse.update 10
      mouse.trigger 'mouseup'
      expect(evt).toBeNull()
    
    it "should note the click count at the first click", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      expect(evt.clickCount).toEqual 1
      
    it "should note the click count at the second click", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      expect(evt.clickCount).toEqual 2
      
    it "should reset click count after some duration", ->
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      mouse.update 10
      mouse.trigger 'mousedown'
      mouse.trigger 'mouseup'
      expect(evt.clickCount).toEqual 1
      
    it "should track clicks separately by button", ->
      mouse.trigger 'mousedown', button: 0
      mouse.trigger 'mousedown', button: 1
      mouse.trigger 'mouseup', button: 0
      button0evt = evt
      mouse.trigger 'mouseup', button: 1
      button1evt = evt
      
      expect(button0evt.clickCount).toEqual 1
      expect(button1evt.clickCount).toEqual 1


