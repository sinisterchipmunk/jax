# this funky syntax is to prevent `Leap` from resolving to
# `Jax.Input.Leap` within the class definition.
Jax.Input.Leap = class _Leap extends Jax.Input
  Jax.Input.devices.push this

  alias: 'leap'

  ###
  Resets captures and tracking variables. Used for teardown.
  ###
  _reset: ->
    @_captures = []
    @_hands = {}

  ###
  Removes duplicate captures from the captures list, so that events are not
  processed more than once per frame.
  ###
  _clearDuplicateCaptures: ->
    for capture in @_captures
      lastIndex = @_captures.lastIndexOf(capture)
      if @_captures.indexOf(capture) isnt lastIndex
        @_captures.splice lastIndex, 1
        return @_clearDuplicateCaptures()
    true

  constructor: ->
    super arguments...
    @_frameRotatedEvent = {}
    @_frameScaledEvent = {}
    @_frameTranslatedEvent = {}
    @_handAddedEvent = {}
    @_handRemovedEvent = {}
    @_frameEvent = {}
    @_handUpdatedEvent = {}
    @_handRotatedEvents = []
    @_handScaledEvents = []
    @_handTranslatedEvents = []
    @_gestureCircledEvents = []
    @_gestureSwipedEvents = []
    @_gestureScreenTappedEvents = []
    @_gestureKeyTappedEvents = []
    @_reset()

  update: (timechange) ->
    super timechange
    @lastFrame = @currentFrame

  startLooping: ->
    return if @looping
    # TODO don't enable gestures if they are not being used
    console.log Leap
    Leap.loop {enableGestures: true}, (data) => @loop data
    @looping = true

  stopListening: ->
    super()
    @_reset()

  register: (controller) ->
    if typeof(Leap) is 'undefined'
      throw new Error "Leap could not be found. Did you include leap.js ?"

    if controller.on_leap_frame
      @startLooping()
      @_captures.push 'captureFrame'
      @on 'frame', (data) => controller.on_leap_frame data
    if controller.leap_frame_rotated
      @startLooping()
      @_captures.push 'captureFrameRotation'
      @on 'frameRotate', (data) -> controller.leap_frame_rotated data
    if controller.leap_frame_scaled
      @startLooping()
      @_captures.push 'captureFrameScale'
      @on 'frameScale', (data) -> controller.leap_frame_scaled data
    if controller.leap_frame_translated
      @startLooping()
      @_captures.push 'captureFrameTranslate'
      @on 'frameTranslate', (data) -> controller.leap_frame_translated data
    if controller.leap_hand_added
      @startLooping()
      @_captures.push 'captureHandAdd'
      @on 'handAdd', (data) -> controller.leap_hand_added data
    if controller.leap_hand_removed
      @startLooping()
      @_captures.push 'captureHandAdd'
      @_captures.push 'captureHandRemove'
      @on 'handRemove', (data) -> controller.leap_hand_removed data
    if controller.leap_hands_updated
      @startLooping()
      @_captures.push 'captureHandAdd'
      @_captures.push 'captureHandRemove'
      @_captures.push 'captureHandUpdate'
      @on 'handUpdate', (data) -> controller.leap_hands_updated data
    if controller.leap_hand_rotated
      @startLooping()
      @_captures.push 'captureHandRotate'
      @on 'handRotate', (events) ->
        for event in events
          controller.leap_hand_rotated event
        true
    if controller.leap_hand_scaled
      @startLooping()
      @_captures.push 'captureHandScale'
      @on 'handScale', (events) ->
        for event in events
          controller.leap_hand_scaled event
        true
    if controller.leap_hand_translated
      @startLooping()
      @_captures.push 'captureHandTranslate'
      @on 'handTranslate', (events) ->
        for event in events
          controller.leap_hand_translated event
        true
    if controller.leap_gesture_circled
      @startLooping()
      @_captures.push 'captureGestures'
      @on 'gestureCircle', (events) ->
        for event in events
          controller.leap_gesture_circled event
        true
    if controller.leap_gesture_swiped
      @startLooping()
      @_captures.push 'captureGestures'
      @on 'gestureSwipe', (events) ->
        for event in events
          controller.leap_gesture_swiped event
        true
    if controller.leap_gesture_key_tapped
      @startLooping()
      @_captures.push 'captureGestures'
      @on 'gestureKeyTap', (events) ->
        for event in events
          controller.leap_gesture_key_tapped event
        true
    if controller.leap_gesture_screen_tapped
      @startLooping()
      @_captures.push 'captureGestures'
      @on 'gestureScreenTap', (events) ->
        for event in events
          controller.leap_gesture_screen_tapped event
        true
    @_clearDuplicateCaptures()

  loop: (frame) ->
    @currentFrame = frame
    for capture in @_captures
      @[capture] frame
    true

  captureGestures: (frame) ->
    lastFrame = @lastFrame
    gestureCircledEvents = @_gestureCircledEvents
    gestureSwipedEvents = @_gestureSwipedEvents
    gestureScreenTappedEvents = @_gestureScreenTappedEvents
    gestureKeyTappedEvents = @_gestureKeyTappedEvents
    circleIndex = swipeIndex = screenIndex = keyIndex = 0
    for gesture in frame.gestures
      switch gesture.type
        when 'circle'
          event = gestureCircledEvents[circleIndex++] or= {}
        when 'swipe'
          event = gestureSwipedEvents[swipeIndex++] or= {}
        when 'keyTap'
          event = gestureKeyTappedEvents[keyIndex++] or= {}
        when 'screenTap'
          event = gestureScreenTappedEvents[screenIndex++] or= {}
        else throw new Error "Unexpected gesture type: #{gesture.type}"
      event.current = frame
      event.previous = lastFrame
      event.gesture = gesture
    if circleIndex
      gestureCircledEvents.splice circleIndex, gestureCircledEvents.length
      @enqueue 'gestureCircle', gestureCircledEvents
    if swipeIndex
      gestureSwipedEvents.splice swipeIndex, gestureSwipedEvents.length
      @enqueue 'gestureSwipe', gestureSwipedEvents
    if keyIndex
      gestureKeyTappedEvents.splice keyIndex, gestureKeyTappedEvents.length
      @enqueue 'gestureKeyTap', gestureKeyTappedEvents
    if screenIndex
      gestureScreenTappedEvents.splice screenIndex, gestureScreenTappedEvents.length
      @enqueue 'gestureScreenTap', gestureScreenTappedEvents
    true


  ###
  For each hand in the current frame, if it has moved, an event will be
  generated containing the current frame, the previous frame, the hand,
  the cached translation and the cached distance.

  It is more efficient to use the cached values in the event object than it
  is to recalculate them.

  Although multiple events can be generated, one for each hand, in the course
  of a single rendering frame, each event is guaranteed to be unique within
  the frame. For example, you might receive a single event for a right hand
  and a single event for a left hand, but you will not receive two events for
  the left hand.
  ###
  captureHandTranslate: (frame) ->
    return unless lastFrame = @lastFrame
    handTranslatedEvents = @_handTranslatedEvents
    eventIndex = 0
    for hand in frame.hands
      translation = hand.translation lastFrame
      distance = vec3.length translation
      if Math.abs(distance) > Math.EPSILON
        event = handTranslatedEvents[eventIndex++] or= {}
        event.current = frame
        event.previous = lastFrame
        event.hand = hand
        event.distance = distance
        event.translation = translation
    if eventIndex
      handTranslatedEvents.splice eventIndex, handTranslatedEvents.length
      @enqueue 'handTranslate', handTranslatedEvents

  ###
  For each hand in the current frame, if it has scaled, an event will be
  generated containing the current frame, the previous frame, the hand,
  and the cached scale factor.

  It is more efficient to use the cached scale in the event object than it
  is to recalculate the scale using `hand.scaleFactor(event.previous)`.

  Although multiple events can be generated, one for each hand, in the course
  of a single rendering frame, each event is guaranteed to be unique within
  the frame. For example, you might receive a single event for a right hand
  and a single event for a left hand, but you will not receive two events for
  the left hand.
  ###
  captureHandScale: (frame) ->
    return unless lastFrame = @lastFrame
    handScaledEvents = @_handScaledEvents
    eventIndex = 0
    for hand in frame.hands
      if Math.abs(scale = hand.scaleFactor lastFrame) > Math.EPSILON
        event = handScaledEvents[eventIndex++] or= {}
        event.current = frame
        event.previous = lastFrame
        event.hand = hand
        event.scale = scale
    if eventIndex
      handScaledEvents.splice eventIndex, handScaledEvents.length
      @enqueue 'handScale', handScaledEvents

  ###
  For each hand in the current frame, if it has rotated, an event will be
  generated containing the current frame, the previous frame, the hand,
  and the cached angle of rotation.

  It is more efficient to use the cached angle in the event object than it
  is to recalculate the angle using `hand.rotationAngle(event.previous)`.

  Although multiple events can be generated, one for each hand, in the course
  of a single rendering frame, each event is guaranteed to be unique within
  the frame. For example, you might receive a single event for a right hand
  and a single event for a left hand, but you will not receive two events for
  the left hand.
  ###
  captureHandRotate: (frame) ->
    return unless lastFrame = @lastFrame
    eventIndex = 0
    handRotatedEvents = @_handRotatedEvents
    for hand in frame.hands
      if Math.abs(angle = hand.rotationAngle lastFrame) > Math.EPSILON
        event = handRotatedEvents[eventIndex++] or= {}
        event.current = frame
        event.previous = lastFrame
        event.hand = hand
        event.angle = angle
    if eventIndex
      handRotatedEvents.splice eventIndex, handRotatedEvents.length
      @enqueue 'handRotate', handRotatedEvents

  ###
  If the current frame has any `hands`, a `handUpdate` event is emitted
  containing the current frame and the previous frame. No event is emitted
  if there is no `previous` frame, or if there are no `hands` in the current
  frame.
  ###
  captureHandUpdate: (frame) ->
    return unless lastFrame = @lastFrame
    if frame.hands.length
      event = @_handUpdatedEvent
      event.current = frame
      event.previous = lastFrame
      @enqueue 'handUpdate', event

  ###
  Emits a `frame` event containing the current and previous frames.
  ###
  captureFrame: (frame) ->
    event = @_frameEvent
    event.current = frame
    event.previous = @lastFrame
    @enqueue 'frame', event

  ###
  Checks the current frame against the previous to see if a hand has been
  added. If so, an event object containing the new hand, the current frame
  and the previous frame is dispatched.

  Note: for performance reasons, only one hand will be added in the course
  of a single rendering frame. If more than one hand appears in the same
  frame, their events will be fired over the course of multiple frames.
  ###
  captureHandAdd: (frame) ->
    for hand in frame.hands
      unless @_hands[hand.id]
        @_hands[hand.id] = hand
        event = @_handAddedEvent
        event.current = frame
        event.previous = @lastFrame
        event.hand = hand
        return @enqueue 'handAdd', event
    true

  ###
  Checks the current frame against the previous to see if a hand has been
  removed. If so, an event object containing the hand that was removed,
  the current frame and the previous frame is dispatched.

  Note: for performance reasons, only one hand will be removed in the course
  of a single rendering frame. If more than one hand is removed in the same
  frame, their events will be fired over the course of multiple frames.
  ###
  captureHandRemove: (frame) ->
    return unless lastFrame = @lastFrame
    ids = ("#{hand.id}" for hand in frame.hands)
    for id, hand of @_hands
      if ids.indexOf(id) is -1
        event = @_handRemovedEvent
        event.current = frame
        event.previous = lastFrame
        event.hand = hand
        delete @_hands[id]
        return @enqueue 'handRemove', event
    true

  ###
  Checks the current frame against the previous to see if it has been rotated.
  If so, an event object containing both the current and previous frames, as
  well as the cached angle between them, is dispatched. NOTE: It is more
  efficient to use the cached angle in your own code, instead of calling
  `frameEvt.current.rotationAngle(frameEvt.previous)`.
  ###
  captureFrameRotation: (frame) ->
    return unless lastFrame = @lastFrame
    if Math.abs(angle = frame.rotationAngle lastFrame) > Math.EPSILON
      event = @_frameRotatedEvent
      event.current = frame
      event.previous = lastFrame
      event.angle = angle
      @enqueue 'frameRotate', event

  ###
  Checks the current frame against the previous to see if it has been scaled.
  If so, an event object containing both the current and previous frames, as
  well as the cached scale factor, is dispatched. NOTE: it is more efficient
  to use the cached scale factor in your own code, instead of calling
  `frameEvt.current.scaleFactor(frameEvt.previous)`.
  ###
  captureFrameScale: (frame) ->
    return unless lastFrame = @lastFrame
    if Math.abs(1 - scale = frame.scaleFactor lastFrame) > Math.EPSILON
      event = @_frameScaledEvent
      event.current = frame
      event.previous = lastFrame
      event.scale = scale
      @enqueue 'frameScale', event

  ###
  Checks the current frame against the previous to see if it has been
  translated. If so, an event object containing both the current and previous
  frames, as well as the cached translation and distance, is dispatched.
  NOTE: it is more efficient to use the cached values in your own code, rather
  than recalculating the translation distance or calling
  `frameEvt.current.translation(frameEvt.previous)`.
  ###
  captureFrameTranslate: (frame) ->
    return unless lastFrame = @lastFrame
    translation = frame.translation lastFrame
    distance = vec3.length translation
    if Math.abs(distance) > Math.EPSILON
      event = @_frameTranslatedEvent
      event.current = frame
      event.previous = lastFrame
      event.translation = translation
      event.distance = distance
      @enqueue 'frameTranslate', event
