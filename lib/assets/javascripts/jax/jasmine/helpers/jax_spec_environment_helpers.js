(function() {
  var _origEmitObject = jasmine.StringPrettyPrinter.prototype.emitObject;
  jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
    if (obj instanceof Jax.Model) {
      this.append("[" + (obj.__proto__ ? obj.__proto__.constructor.name : "Jax.Model") + " with ID ");
      jasmine.StringPrettyPrinter.prototype.emitScalar.call(this, obj.__unique_id);
      this.append("]");
      return;
    }
    if (obj instanceof Jax.Context) {
      this.append("[Jax.Context with ID ");
      jasmine.StringPrettyPrinter.prototype.emitScalar.call(this, obj.id);
      this.append(" (" + obj.gl.canvas.id + ")]");
      return;
    }
    if (obj instanceof Jax.Mesh.Base) {
      this.append("[" + (obj.__proto__ ? obj.__proto__.constructor.name : "Jax.Mesh") + " with ");
      jasmine.StringPrettyPrinter.prototype.emitScalar.call(this, obj.data.length);
      this.append(" vertices]");
      return;
    }

    _origEmitObject.call(this, obj);
  };
})();

jasmine.isArray_ = function(value) {
  return jasmine.isA_("Array", value) || jasmine.isA_("Float32Array", value);
};

function setupJaxSpecContext() {
  /*
    Create a canvas element and add it to the document. 
    There's nothing special about this element.
   */
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", 600);
  canvas.setAttribute("height", 400);
  canvas.width = 600;
  canvas.height = 400;
  canvas.setAttribute("id", "spec-canvas");
  if (canvas.style)
    canvas.style.display = "none";
  document.body.appendChild(canvas);
  
  beforeEach(function() {
    Jax.getGlobal().SPEC_CONTEXT = this.context = new Jax.Context(canvas);
    this.world = this.context.world;
  });
  
  afterEach(function() {
    Jax.getGlobal().SPEC_CONTEXT.dispose();
  })
}

if (typeof(global) != 'undefined') {
  global.setupJaxTestEnvironment = setupJaxTestEnvironment;
  global.setupJaxSpecContext = setupJaxSpecContext;
}

if (typeof(window) != 'undefined') {
  var oldOnload = null;
  if (window.onload) {
    oldOnload = window.onload;
  }
  window.onload = function() {
    setupJaxSpecContext();
    window.onload = null;
    oldOnload && oldOnload();
  };
}
