#= require "./dom-helpers"

# Runs the specified demo fullscreen
# eg: http://localhost:3000/run_webgl_demo#geodes

$(window).ready( () ->

  canvas = document.getElementById("webgl")

  w = window.innerWidth
  h = window.innerHeight

  canvas.width = w
  canvas.height = h
  canvas.clientWidth = w
  canvas.clientHeight= h

  url = new Uri(window.location);

  demo = url.anchor() || "geodes"

  window.jax or= new Jax.Context canvas
  if Jax.routes.getControllerNames().indexOf(demo) != 1
    window.jax.redirectTo demo
  else
    alert 'Provide the name of the demo in the url after the #.'


)