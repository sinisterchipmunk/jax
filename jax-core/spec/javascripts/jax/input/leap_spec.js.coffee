# stub Leap, user has to provide this in a real app
window.Leap = { loop: -> }

describe 'Jax.Input.Leap', ->
  factory = (overrides, result) ->
    for k, v of overrides
      result[k] = v
    result

  frameFactory = (data) ->
    factory data,
      rotationAxis: -> [1,0,0]
      rotationAngle: -> 0
      rotationMatrix: -> [1,0,0,0,1,0,0,0,1]
      scaleFactor: -> 1
      translation: -> [0,0,0]
      hands: []
      pointables: []
      gestures: []

  handFactory = (data) ->
    factory data,
      id: Jax.guid()
      direction: [0,0,1]
      palmNormal: [0,0,1]
      palmPosition: [0,0,0]
      palmVelocity: [0,0,0]
      sphereCenter: [0,0,0]
      sphereRadius: 1
      translation: -> [0,0,0]
      rotationAxis: -> [1,0,0]
      rotationAngle: -> 0
      rotationMatrix: -> [1,0,0,0,1,0,0,0,1]
      scaleFactor: -> 1
      pointables: []

  gestureFactory = (data) ->
    factory data,
      type: 'circle'

  beforeEach ->
    spyOn Leap, 'loop'
    @leap = new Jax.Input.Leap @context.canvas
    @loop = (data) =>
      @leap.loop data
      @leap.update(0)

  describe 'given a controller listening for the various gestures', ->
    gestures = null

    beforeEach ->
      gestures = []
      @controller =
        leap_gesture_circled: (g) -> gestures.push g
        leap_gesture_swiped:  (g) -> gestures.push g
        leap_gesture_key_tapped: (g) -> gestures.push g
        leap_gesture_screen_tapped: (g) -> gestures.push g
      @leap.register @controller
      spyOn @controller, 'leap_gesture_circled'
      spyOn @controller, 'leap_gesture_swiped'
      spyOn @controller, 'leap_gesture_key_tapped'
      spyOn @controller, 'leap_gesture_screen_tapped'

    it 'should map Leap.loop to its @loop method', ->
      expect(Leap.loop).toHaveBeenCalled()

    it 'should dispatch circle gestures', ->
      @loop frame = frameFactory gestures: [gesture = gestureFactory type: 'circle']
      expect(@controller.leap_gesture_circled).toHaveBeenCalledWith
        current: frame
        gesture: gesture
        previous: undefined

    it 'should dispatch swipe gestures', ->
      @loop frame = frameFactory gestures: [gesture = gestureFactory type: 'swipe']
      expect(@controller.leap_gesture_swiped).toHaveBeenCalledWith
        current: frame
        gesture: gesture
        previous: undefined

    it 'should dispatch keytap gestures', ->
      @loop frame = frameFactory gestures: [gesture = gestureFactory type: 'keyTap']
      expect(@controller.leap_gesture_key_tapped).toHaveBeenCalledWith
        current: frame
        gesture: gesture
        previous: undefined

    it 'should dispatch screentap gestures', ->
      @loop frame = frameFactory gestures: [gesture = gestureFactory type: 'screenTap']
      expect(@controller.leap_gesture_screen_tapped).toHaveBeenCalledWith
        current: frame
        gesture: gesture
        previous: undefined

  # lowest level event listener, can be used to get all information about
  # a frame, and thus all information in general
  describe 'given a controller with a frame listener', ->
    frame = null
    beforeEach ->
      @controller = { on_leap_frame: (f) -> frame = f }
      @leap.register @controller
      spyOn @controller, 'on_leap_frame'

    it 'should map Leap.loop to its @loop method', ->
      expect(Leap.loop).toHaveBeenCalled()

    it 'should dispatch all data from Leap.loop into the controller', ->
      @loop 1
      expect(@controller.on_leap_frame).toHaveBeenCalledWith
        current: 1
        previous: undefined

  describe 'comparison with previous frames:', ->
    frame = data = lastFrame = null

    beforeEach ->
      # `lastFrame` is a public API so it's safe to assign it here.
      @leap.lastFrame = lastFrame = frameFactory rotationAngle: -> 1

    describe 'given a controller with a hand translated listener', ->
      beforeEach ->
        @controller = { leap_hand_translated: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hand_translated'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory hands: [ hand = handFactory translation: -> [1,0,0] ]
        expect(@controller.leap_hand_translated).toHaveBeenCalledWith
          translation: [1,0,0]
          distance: 1
          hand: hand
          current: frame
          previous: lastFrame

      it 'should dispatch one event per hand into the controller', ->
        @loop frame = frameFactory hands: [
          hand1 = handFactory translation: -> [1,0,0]
          hand2 = handFactory translation: -> [1,0,0]
        ]
        expect(@controller.leap_hand_translated).toHaveBeenCalledWith
          translation: [1,0,0]
          distance: 1
          hand: hand1
          current: frame
          previous: lastFrame
        expect(@controller.leap_hand_translated).toHaveBeenCalledWith
          translation: [1,0,0]
          distance: 1
          hand: hand2
          current: frame
          previous: lastFrame

    describe 'given a controller with a hand rotated listener', ->
      beforeEach ->
        @controller = { leap_hand_rotated: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hand_rotated'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory hands: [ hand = handFactory rotationAngle: -> 1 ]
        expect(@controller.leap_hand_rotated).toHaveBeenCalledWith
          angle: 1
          hand: hand
          current: frame
          previous: lastFrame

      it 'should dispatch one event per hand into the controller', ->
        @loop frame = frameFactory hands: [
          hand1 = handFactory rotationAngle: -> 1
          hand2 = handFactory rotationAngle: -> 1
        ]
        expect(@controller.leap_hand_rotated).toHaveBeenCalledWith
          angle: 1
          hand: hand1
          current: frame
          previous: lastFrame
        expect(@controller.leap_hand_rotated).toHaveBeenCalledWith
          angle: 1
          hand: hand2
          current: frame
          previous: lastFrame

    describe 'given a controller with a hand scaled listener', ->
      beforeEach ->
        @controller = { leap_hand_scaled: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hand_scaled'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory hands: [ hand = handFactory scaleFactor: -> 0.5 ]
        expect(@controller.leap_hand_scaled).toHaveBeenCalledWith
          scale: 0.5
          hand: hand
          current: frame
          previous: lastFrame

      it 'should dispatch one event per hand into the controller', ->
        @loop frame = frameFactory hands: [
          hand1 = handFactory scaleFactor: -> 0.5
          hand2 = handFactory scaleFactor: -> 0.5
        ]
        expect(@controller.leap_hand_scaled).toHaveBeenCalledWith
          scale: 0.5
          hand: hand1
          current: frame
          previous: lastFrame
        expect(@controller.leap_hand_scaled).toHaveBeenCalledWith
          scale: 0.5
          hand: hand2
          current: frame
          previous: lastFrame

    describe 'given a controller with a frame rotated listener', ->
      beforeEach ->
        @controller = { leap_frame_rotated: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_frame_rotated'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory rotationAngle: -> 1
        expect(@controller.leap_frame_rotated).toHaveBeenCalledWith
          angle: 1
          current: frame
          previous: lastFrame

    describe 'given a controller with a frame scaled listener', ->
      beforeEach ->
        @controller = { leap_frame_scaled: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_frame_scaled'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory scaleFactor: -> 0.5
        expect(@controller.leap_frame_scaled).toHaveBeenCalledWith
          scale: 0.5
          current: frame
          previous: lastFrame

    describe 'given a controller with a frame translated listener', ->
      beforeEach ->
        @controller = { leap_frame_translated: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_frame_translated'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory translation: -> [1,0,0]
        expect(@controller.leap_frame_translated).toHaveBeenCalledWith
          translation: [1,0,0]
          distance: 1
          current: frame
          previous: lastFrame

    describe 'given a controller with a hand added listener', ->
      beforeEach ->
        @controller = { leap_hand_added: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hand_added'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop frame = frameFactory hands: [ hand = handFactory() ]
        expect(@controller.leap_hand_added).toHaveBeenCalledWith
          current: frame
          previous: lastFrame
          hand: hand

      it 'should not fire the added handler twice for the same hand', ->
        hand = handFactory()
        @loop frame = frameFactory hands: [ hand ]
        @controller.leap_hand_added.reset()
        @loop frame = frameFactory hands: [ hand ]
        expect(@controller.leap_hand_added).not.toHaveBeenCalled()

      it 'should fire the added handler once each for multiple hands', ->
        hands = []
        @controller.leap_hand_added = (event) -> hands.push event.hand
        @loop frame1 = frameFactory hands: [ hand1 = handFactory() ]
        @loop frame2 = frameFactory hands: [ hand2 = handFactory() ]
        expect(hands[0]).toEqual hand1
        expect(hands[1]).toEqual hand2

    describe 'given a controller with a hand removed listener', ->
      beforeEach ->
        @controller = { leap_hand_removed: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hand_removed'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop lastFrame = frameFactory hands: [ hand = handFactory() ]
        @loop frame = frameFactory hands: []
        expect(@controller.leap_hand_removed).toHaveBeenCalledWith
          current: frame
          previous: lastFrame
          hand: hand

      it 'should not fire the removed handler twice for the same hand', ->
        @loop lastFrame = frameFactory hands: [ hand = handFactory() ]
        @loop frame = frameFactory()
        @controller.leap_hand_removed.reset()
        @loop frame = frameFactory()
        expect(@controller.leap_hand_removed).not.toHaveBeenCalled()

      it 'should fire the removed handler once each for multiple hands', ->
        hands = []
        @controller.leap_hand_removed = (event) -> hands.push event.hand
        @loop frame1 = frameFactory hands: [ hand1 = handFactory() ]
        @loop frame2 = frameFactory hands: [ hand2 = handFactory() ]
        @loop remove1 = frameFactory hands: [hand2]
        @loop remove2 = frameFactory()
        expect(hands[0]).toEqual hand1
        expect(hands[1]).toEqual hand2

    describe 'given a controller with a hands updated listener', ->
      beforeEach ->
        @controller = { leap_hands_updated: (d) -> data = d }
        @leap.register @controller
        spyOn @controller, 'leap_hands_updated'

      it 'should map Leap.loop to its @loop method', ->
        expect(Leap.loop).toHaveBeenCalled()

      it 'should dispatch the event into the controller', ->
        @loop lastFrame = frameFactory hands: [ hand = handFactory() ]
        @loop frame = frameFactory hands: [ hand ]
        expect(@controller.leap_hands_updated).toHaveBeenCalledWith
          current: frame
          previous: lastFrame

      it 'should fire the updated handler once each for multiple hands in the same frame', ->
        hands = []
        @controller.leap_hands_updated = (event) -> hands.push event.current.hands
        @loop frame1 = frameFactory hands: [ hand1 = handFactory(), hand2 = handFactory() ]
        @loop frame2 = frameFactory hands: [ hand1, hand2 ]
        expect(hands[0]).toEqual [hand1, hand2]

  describe 'given a controller with no listeners', ->
    beforeEach ->
      @controller = {}
      @leap.register @controller

    it 'should not enter the Leap loop at all', ->
      expect(Leap.loop).not.toHaveBeenCalled()
