#= require jax/mixins/event_emitter

###
## class Jax.Controller

Controllers are a major component of the Jax framework, because they are in
charge of receiving input from the user, setting up a scene, tearing it down,
and deciding when is the right time to transition to a different controller.

Methods added to controllers are called actions. You can name actions whatever
you want, but some action names serve special purposes.
They are automatically *called* by Jax as follows:

  * *index*          - when the action name is omitted from a route.
  * *destroy*        - when leaving the current controller.
  * *leap_frame*     - when a leap motion captures a frame
  * *leap_frame_rotated*    - when a leap frame has been rotated
  * *leap_frame_scaled*     - when a leap frame has been scaled
  * *leap_frame_translated* - when a leap frame has been translated
  * *leap_hand_added*       - when a leap hand has been added
  * *leap_hand_removed*     - when a leap hand has been removed
  * *leap_hand_updated*     - when a leap hand has been updated
  * *leap_hand_rotated*     - when a leap hand has been rotated
  * *leap_hand_scaled*      - when a leap hand has been scaled
  * *leap_hand_translated*  - when a leap hand has been translated
  * *leap_gesture_circled*  - when a leap gesture has circled
  * *leap_gesture_swiped*   - when a leap gesture has swiped
  * *leap_gesture_key_tapped*    - when a leap gesture mimics a key being tapped
  * *leap_gesture_screen_tapped* - when a leap gesture mimics a screen being tapped
  * *mouse_clicked*  - when the mouse is clicked within the canvas.
  * *mouse_entered*  - when the mouse enters the canvas.
  * *mouse_exited*   - when the mouse exits the canvas.
  * *mouse_moved*    - when the mouse is moved, unless a button is pressed.
  * *mouse_dragged*  - when the mouse is moved while a button is pressed.
  * *mouse_scrolled* - when the mouse wheel has been scrolled
  * *mouse_pressed*  - when a mouse button has been pressed.
  * *mouse_released* - when a mouse button has been released.
  * *mouse_clicked*  - when a mouse button has been clicked.
  * *key_pressed*    - when a keyboard button has been pressed.
  * *key_released*   - when a keyboard button has been released.
  * *key_typed*      - when a keyboard button has been typed.
  * *update*         - (approximately) 60 times per second for
                       as long as this controller is active.
                       Time difference in seconds is passed as an argument.
  
Example:

    class WelcomeController extends Jax.Controller
      views:
        index: "welcome/index"

      index: ->
        # ...

      mouse_clicked: (event) ->
        # ...

      update: (timechange) ->
        # it's been [timechange] seconds since last update

With the exception of event actions, which will be fired every time an event occurs,
controller actions are only triggered once for a given controller unless they
redirect to other actions or call them directly. They differ from their
corresponding views in this way, as a view is rendered many times -- up to a
target rate of 60 times per second.
###
class Jax.Controller
  index: ->

  fireAction: (actionName, context) ->
    if context
      @context = context
      @world = context?.world
    @activeCamera or= @world?.cameras[0]

    unless @[actionName]
      throw new Error "Action '#{actionName}' not found"
    @actionName = actionName

    @[actionName]()
    if viewKey = @views?[actionName]
      @view = Jax.views.find viewKey

    this

Jax.controllers = new class Jax.ControllerLibrary
  @include Jax.Mixins.EventEmitter

  constructor: ->
    @index = {}

  add: (name, klass) ->
    @index[name] = klass
    @trigger 'add',
      name: name
      class: klass

  remove: (name) ->
    if klass = @index[name]
      delete @index[name]
      @trigger 'remove',
        name: name
        class: klass

  getNames: ->
    name for name, klass of @index

  get: (name) ->
    @index[name]
