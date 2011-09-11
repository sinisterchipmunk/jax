fill = (select) ->
  for controller_name in Jax.routes.getControllerNames()
    option = document.createElement 'option'
    option.text = controller_name
    option.value = controller_name
    select.add(option, null)
  
  $(select).change ->
    select.webgl_context or= new Jax.Context("webgl")
    select.webgl_context.redirectTo(select[select.selectedIndex].value)

$(document).ready ->
  select = $("#controller-select")[0]
  fill select if select

# used for unit testing
Jax.getGlobal()._controller_select_fill = fill
