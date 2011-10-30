text = (caption) ->
  document.createTextNode caption

link = (caption, callback) ->
  _link = document.createElement 'a'
  _link.setAttribute 'href', '#'
  $(_link).append text(caption)
  $(_link).click callback
  _link

div = (inner) ->
  _div = document.createElement 'div'
  $(_div).append inner
  _div
  
controller = -> $("#preview")[0].context.current_controller

material = (name) ->
  div link(name, ->
    controller().material = name
    false
  )
  
setup_preview = ->
  Jax.Controller.create "jax_suite",
    index: ->
      @object = new Jax.Model mesh: new Jax.Mesh.Sphere, position: [0,0,-3]
      @world.addObject @object
    mouse_dragged: (m) ->
      @object.camera.pitch m.diffy * -0.01
      @object.camera.yaw   m.diffx *  0.01
    update: -> @object.mesh.material = @material
  
  canvas = $("#preview")[0]
  canvas.context = new Jax.Context canvas, root:"jax_suite"

$(document).ready ->
  for material_name in Jax.Material.all()
    $("#material-list").append material(material_name)
    
  setup_preview()

  $("#mesh").change ->
    controller().object.mesh = eval("new #{@options[@selectedIndex].value}()");
