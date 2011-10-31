window.Suite = {}

Suite.text = (caption) ->
  document.createTextNode caption

Suite.link = (caption, callback) ->
  _link = document.createElement 'a'
  _link.setAttribute 'href', '#'
  $(_link).append Suite.text(caption)
  $(_link).click callback
  _link

Suite.div = (inner) ->
  _div = document.createElement 'div'
  $(_div).append inner
  _div
  
