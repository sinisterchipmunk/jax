#= require "./dom-helpers"

{div, link} = Suite
context = null

controller = (name) ->
  div link name, ->
    context or= new Jax.Context "webgl"
    # jax doesn't unload redirects to the same controller.
    # Within a single app this is probably expected behavior.
    # But, in this particular context, user most likely wants
    # to reload the controller entirely. So we need to manually
    # kick off the cleanup procedure.
    context.unloadScene()
    context.redirectTo name
    false
  
$(document).ready ->
  controller_list = $("#controller-list")[0]
  
  for controller_name in Jax.routes.getControllerNames()
    $(controller_list).append controller(controller_name)
