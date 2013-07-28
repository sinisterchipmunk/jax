describe "Jax.Input.Mouse", ->
  stubCanvasTrigger = ->
    _trigger = canvas.trigger
    canvas.trigger = ->
      _trigger.apply this, arguments
      mouse.update(0)

  evt = mouse = canvas = null
  beforeEach ->
    evt = null
    canvas = $ document.createElement('canvas')
    mouse = new Jax.Input.Mouse canvas
    stubCanvasTrigger canvas
  
  it "should not initially register any handlers", ->
    spyOn @context.canvas, 'addEventListener'
    new Jax.Input.Mouse @context.canvas
    expect(@context.canvas.addEventListener).not.toHaveBeenCalled()
    
  describe "with a scaled canvas", ->
    target = voffset = LEFT = TOP = null
    beforeEach ->
      LEFT = 202
      TOP = 252
      canvas =  $ target = document.createElement('canvas')
      stubCanvasTrigger canvas
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
      mouse.register {mouse_moved: (e) -> evt = e }
      canvas.trigger jQuery.Event 'mousemove',
        pageX: LEFT
        pageY: TOP
        target: target
      expect(evt.x).toEqual 0
      expect(evt.y).toEqual 0
      
    it "should track differences in `x` and `y`", ->
      mouse.register {mouse_moved: (e) -> evt = e }
      canvas.trigger jQuery.Event 'mousemove',
        pageX: LEFT + 3
        pageY: TOP  + 3
        target: target
      canvas.trigger jQuery.Event 'mousemove',
        pageX: LEFT + 10
        pageY: TOP  + 1
        target: target
      expect(evt.diffx).toBeGreaterThan 0
      expect(evt.diffy).toBeLessThan 0

    it "should massage mouse position into real framebuffer coordinates", ->
      mouse.register {mouse_moved: (e) -> evt = e }
      canvas.trigger jQuery.Event 'mousemove',
        pageX: LEFT + 300
        pageY: TOP  + 300
        target: target
      expect(evt.x).toEqual 150
      expect(evt.y).toEqual 150
    
  describe "with a mouse drag handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.register {mouse_dragged: (e) -> events.push e }
      
    it "should stop dragging when the mouse leaves the canvas", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mouseout'
      canvas.trigger 'mouseover'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 1
      
    it "should stop dragging when the mouse is clicked", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      canvas.trigger 'click'
      canvas.trigger 'mousemove'
      expect(events).toBeEmpty()

    it "should not fire drag event for mouse moves while button is depressed", ->
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 0
      
    it "should fire drag event for each mouse move while button is pressed", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 3
      
    it "should stop firing drag events after the mouse has been depressed", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mouseup'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 1
    
  describe "with a mouse move handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.register {mouse_moved: (e) -> events.push e }
      
    it "should continue moving when the mouse leaves the canvas", ->
      canvas.trigger 'mousemove'
      canvas.trigger 'mouseout'
      canvas.trigger 'mouseover'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 2
      
    it "should continue moving when the mouse is clicked", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      canvas.trigger 'click'
      canvas.trigger 'mousemove'
      expect(events).not.toBeEmpty()

    it "should fire move event for mouse moves while button is depressed", ->
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 3
      
    it "should not fire move event for each mouse move while button is pressed", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 0
      
    it "should resume firing move events after the mouse has been depressed", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mouseup'
      canvas.trigger 'mousemove'
      canvas.trigger 'mousemove'
      expect(events.length).toEqual 2
    
  describe "with a mouse over handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.register {mouse_over: (e) -> events.push e }
    
    it "should fire the over event as many times as it occurs in DOM", ->
      canvas.trigger 'mouseover'
      canvas.trigger 'mouseover'
      canvas.trigger 'mouseover'
      expect(events.length).toEqual 3
      
  describe "with a mouse exit handler", ->
    beforeEach ->
      mouse.register {mouse_exited: (e) -> evt = e }

    it "should fire the exit event when it is received", ->
      canvas.trigger 'mouseout'
      expect(evt).not.toBeNull()

  describe "with a mouse entered handler", ->
    events = null
    beforeEach ->
      events = []
      mouse.register {mouse_entered: (e) -> events.push e }
    
    it "should fire the entered event only once for a set of over events", ->
      canvas.trigger 'mouseover'
      canvas.trigger 'mouseover'
      canvas.trigger 'mouseover'
      expect(events.length).toEqual 1
      
    it "should fire the entered event again if the mouse exits and then re-enters", ->
      canvas.trigger 'mouseover'
      canvas.trigger 'mouseout'
      canvas.trigger 'mouseover'
      expect(events.length).toEqual 2
    
  describe "with a mouse press handler", ->
    beforeEach -> mouse.register {mouse_pressed: (e) -> evt = e }
    
    it "should fire when the mouse is down", ->
      canvas.trigger 'mousedown'
      expect(evt).not.toBeNull()
      
    it "should not fire when the mouse is released", ->
      canvas.trigger 'mouseup'
      expect(evt).toBeNull()
      
  describe "with a mouse release handler", ->
    beforeEach -> mouse.register {mouse_released: (e) -> evt = e }
    
    it "should fire when the mouse is up", ->
      canvas.trigger 'mouseup'
      expect(evt).not.toBeNull()
  
  describe "with a mouse click handler", ->
    beforeEach -> mouse.register {mouse_clicked: (e) -> evt = e }

    it "should not fire if the mouse moves between clicks", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mousemove'
      canvas.trigger 'mouseup'
      expect(evt).toBeNull()
    
    it "should fire when the mouse is down and up in rapid succession", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      expect(evt).not.toBeNull()
      
    it "should not fire if the mouse hasn't been released", ->
      canvas.trigger 'mousedown'
      expect(evt).toBeNull()
      
    it "should not fire when the mouse is down and up slowly", ->
      canvas.trigger 'mousedown'
      # sleep for an arbitrarily high duration for less brittle tests
      mouse.update 10
      canvas.trigger 'mouseup'
      expect(evt).toBeNull()
    
    it "should note the click count at the first click", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      expect(evt.clickCount).toEqual 1
      
    it "should note the click count at the second click", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      expect(evt.clickCount).toEqual 2
      
    it "should reset click count after some duration", ->
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      mouse.update 10
      canvas.trigger 'mousedown'
      canvas.trigger 'mouseup'
      expect(evt.clickCount).toEqual 1
      
    it "should track clicks separately by button", ->
      canvas.trigger jQuery.Event 'mousedown', button: 0
      canvas.trigger jQuery.Event 'mousedown', button: 1
      canvas.trigger jQuery.Event 'mouseup', button: 0
      button0evt = evt
      canvas.trigger jQuery.Event 'mouseup', button: 1
      button1evt = evt
      
      expect(button0evt.clickCount).toEqual 1
      expect(button1evt.clickCount).toEqual 1


