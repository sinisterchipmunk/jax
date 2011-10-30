var jsApiReporter;

function setupJaxTestEnvironment() {
  var jasmineEnv = jasmine.getEnv();

  jsApiReporter = new jasmine.JsApiReporter();
  var trivialReporter = new jasmine.TrivialReporter();

  jasmineEnv.addReporter(jsApiReporter);
  jasmineEnv.addReporter(trivialReporter);

  jasmineEnv.specFilter = function(spec) {
    return trivialReporter.specFilter(spec);
  };

  setupJaxSpecContext();

  jasmineEnv.execute();
}

function setupJaxSpecContext() {
  /*
    Create a canvas element and add it to the document. 
    There's nothing special about this element.
   */
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", 600);
  canvas.setAttribute("height", 400);
  canvas.setAttribute("id", "spec-canvas");
  if (canvas.style)
    canvas.style.display = "none";
  document.body.appendChild(canvas);
  
  beforeEach(function() {
    Jax.getGlobal().SPEC_CONTEXT = new Jax.Context(canvas);
  });
  
  afterEach(function() {
    Jax.getGlobal().SPEC_CONTEXT.dispose();
  })
}

if (typeof(global) != 'undefined') {
  global.setupJaxTestEnvironment = setupJaxTestEnvironment;
  global.setupJaxSpecContext = setupJaxSpecContext;
}
