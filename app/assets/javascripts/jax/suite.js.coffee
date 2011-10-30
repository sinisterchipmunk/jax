$(document).ready ->
  $("#nav ul li").click (evt) ->
    if $(evt.target).hasClass 'selected'
      return false
    else
      document.location = evt.target.dataset['content']
  
  for el in $("#nav ul li")
    if document.location.toString().indexOf(el.dataset['content'].toString()) != -1
      $(el).addClass "selected"
  