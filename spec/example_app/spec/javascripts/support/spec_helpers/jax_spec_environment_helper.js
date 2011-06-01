function setupJaxTestEnvironment() {
  var jasmineEnv = jasmine.getEnv();

  jsApiReporter = new jasmine.JsApiReporter();
  var trivialReporter = new jasmine.TrivialReporter();

  jasmineEnv.addReporter(jsApiReporter);
  jasmineEnv.addReporter(trivialReporter);

  jasmineEnv.specFilter = function(spec) {
    return trivialReporter.specFilter(spec);
  };

  /*
    Create a canvas element and add it to the document. 
    There's nothing special about this element.
   */
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "spec-canvas");
  canvas.style.display = "none";
  document.body.appendChild(canvas);
  
  beforeEach(function() {
    window.SPEC_CONTEXT = new Jax.Context(canvas);
  });
  
  afterEach(function() {
    SPEC_CONTEXT.dispose();
  })


  jasmineEnv.execute();
}
