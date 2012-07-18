/* Indentation for file names based on their paths */
/*
$(document).ready(function() {
  var last = null, indent = 0;
  $('#jump_to a.source').each(function(i, ele) {
    var text = $(ele).text();
    var parts = text.split(/\//);
    if (last != null) {
      indent += parts.length - last.length;
      $(ele).css('padding-left', indent+"0px");
      $(ele).text(parts[parts.length-1]);
    }
    last = parts;
  });
});
*/

var jax;
/* Set up a Jax for each example, and execute the code for each example */
$(document).ready(function() {
  function exampleCode(tr) {
    return CoffeeScript.compile($(tr).find('td.code').text().trim(), {bare: true});
  }
  
  // prepare setup function to be called before each example
  var setup = "";
  $('tr#section-Setup').each(function(i, tr) { setup += exampleCode(tr); });
  setup = new Function(setup);
  
  $('tr.section').each(function(i, tr) {
    var label = $(tr).attr('id').replace('section-', 'jax_');

    $(tr).find("canvas").each(function(j, canvas) {
      // set canvas width and height since we usually don't do that
      // within the documentation
      canvas.width = $(canvas).width();
      canvas.height = $(canvas).height();
      
      // create the context and hook it into window for easier debugging
      window[label] = jax = new Jax.Context(canvas, {focus: false});
      
      // set clear color to transparent
      jax.gl.clearColor(0, 0, 0, 0);
      
      // create a controller to contain example code
      Jax.Controller.create("example", {
        index: function() { }
      });
      
      // redirect to the controller to set up the scene
      jax.redirectTo("example");
      
      // execute setup and example code
      var example = new Function(exampleCode(tr));
      try {
        setup.call(jax.controller);
        example.call(jax.controller);
      } catch(error) {
        console.log(error.stack);
      }
    });
  });
});
