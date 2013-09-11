#= require leap

SPEED = 0
MAX_SPEED = 1.5
SCALE = 1 / 800
_hands = 0
_vec = vec3.create()
_handID = null
_pauseNotifier = null

local = {} # don't clash with Leap namespace if it exists
class local.Leap extends Jax.Controller
  Jax.controllers.add @name, this

  index: ->
    style = "border:1px solid rgb(239,140,8);border-radius:8px;"+
            "position:absolute;left:40%;right:40%;top:40%;bottom:40%;"+
            "background-color: rgb(51,51,51);opacity: 0.8;"+
            "color:rgb(239,140,8);overflow:visible;padding:12px;"+
            "text-align:center;"
    _pauseNotifier = $ "<div style='#{style}'><h3>Paused</h3>"+
                       "<p>Move hand over device to start or resume</p>"+
                       "</div>"
    document.body.appendChild _pauseNotifier[0]

    # @activeCamera.setFixedYawAxis false

    @world.addLight new Jax.Light.Directional
      position: [3, 3, 3]
      direction: [1, -1, 1]
      attenuation:
        constant: 1
        linear: 0
        quadratic: 0
      shadows: false
      color:
        ambient: '#111'
        diffuse: '#eee'
        specular: '#fff'

    mesh = new Jax.Mesh.Sphere radius: 0.25

    for x in [-3..3]
      for y in [-3..3]
        for z in [-3..3]
          continue if x is 0 and y is 0 and z is 0
          @world.addObject new Jax.Model
            mesh: mesh
            position: [x*2, y*2, z*2]

  leap_hand_added: (event) ->
    _handID or= event.hand.id
    _hands += 1
    SPEED = MAX_SPEED
    _pauseNotifier.hide()

  leap_hand_removed: (event) ->
    _hands--
    if _hands <= 0
      SPEED = 0
      _handID = null
      _pauseNotifier.show()

  leap_hand_translated: (event) ->
    if event.hand.id is _handID
      position = vec3.scale _vec, event.hand.palmPosition, SCALE
      
  update: (tc) ->
    if (SPEED)
      @activeCamera.pitch tc * _vec[2]
      @activeCamera.yaw tc * -_vec[0]
      @activeCamera.move tc * SPEED * _vec[1]
