#= require "./dom-helpers"

{div, link} = Suite
  
setup_preview = ->
  Jax.Controller.create "jax_suite",
    index: ->
      @object = new Jax.Model mesh: new Jax.Mesh.Sphere, position: [0,0,-3]
      @world.addObject @object
    mouse_dragged: (m) ->
      @object.camera.pitch m.diffy * -0.01
      @object.camera.yaw   m.diffx *  0.01
    update: ->
      @object.mesh.material = @material if @material
  
  canvas = $("#preview")[0]
  canvas.context = new Jax.Context canvas, root:"jax_suite"

controller = -> $("#preview")[0].context.controller

material = (name) ->
  div link(name, ->
    controller().material = name
    false
  )
  
$(document).ready ->
  for material_name in Jax.Material.all()
    $("#material-list").append material(material_name)
    
  setup_preview()

  $("#mesh").change ->
    controller().object.mesh = eval("new #{@options[@selectedIndex].value}()");
