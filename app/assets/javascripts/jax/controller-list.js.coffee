#= require "./dom-helpers"

{div, link} = Suite

controller = (name) ->
  div link name, ->
    window.jax or= new Jax.Context "webgl"
    window.jax.redirectTo name
    document.getElementsByTagName("canvas")[0].focus()
    false
  
$(document).ready ->
  controller_list = $("#controller-list")[0]
  
  for controller_name in Jax.routes.getControllerNames()
    $(controller_list).append controller(controller_name)
