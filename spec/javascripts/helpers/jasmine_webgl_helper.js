function glit() {
  // If testing with node.js, the GL context will (currently) be fake, making it impossible
  // to do proper picking. TODO make the GL context real! (Yes, it can be done -- see
  // https://github.com/pufuwozu/node-webgl.) For now, disable GL-specific tests under node.
  if (Jax.getGlobal().SPEC_CONTEXT && !Jax.getGlobal().SPEC_CONTEXT.gl.fake) {
    it.apply(this, arguments);
  } else {
    xit.apply(this, arguments);
  }
}

if (typeof(exports) != "undefined")
  exports.glit = glit;
