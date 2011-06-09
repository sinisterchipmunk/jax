if (typeof(window) != "undefined") {
  window.addEventListener("load", function() {
    setupJaxSpecContext();

    /*
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", "600");
    canvas.setAttribute("height", "400");
    canvas.setAttribute("id", "canvas-element");
    canvas.style.visibility = "hidden";
    document.body.appendChild(canvas);
  
    var style = document.createElement('style');
    style.innerHTML = ".resultMessage.fail { white-space:pre-line; }";
    document.getElementsByTagName('head')[0].appendChild(style);
    */
  }, false);
}

describe("Jax", function() {
  it("should be loaded", function() {
    /* if false, then it didn't load all of the Jax libraries successfully */
    expect(Jax.loaded).toBeTrue();
  });
  
  it("should create the top-level view container", function() {
    expect(Jax.views).not.toBeUndefined();
  });
  
  it("should initialize the route set", function() {
    expect(Jax.routes).not.toBeUndefined();
  });
});
