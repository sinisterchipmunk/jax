/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */

//= require "jax/vendor/gl-matrix"
//= require_self
/*
  all files in the webgl/ subdirectory will have access to a temporary GL context,
  via `Jax.getGlobal()['GL']`, which will be unloaded after they have been loaded into memory.
 */
//= require "jax/webgl/shader_chain"
//= require "jax/webgl/material"
//= require "jax/webgl/mesh"
//= require "jax/webgl/camera"
//= require "jax/webgl/world"
//= require "jax/webgl/texture"
//= require "jax/webgl/cleanup"

Jax.getGlobal()['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
Jax.getGlobal()['WEBGL_CONTEXT_OPTIONS'] = {stencil:true};
Jax.getGlobal()['GL_METHODS'] = {};

(function() {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "temporary-internal-use");

  try {
    var gl = canvas.getContext(WEBGL_CONTEXT_NAME);
  } catch(e) {
    gl = null;
  }

  if (gl) {
    for (var method_name in gl)
      // define the GL enums globally so we don't need a context to reference them
      if (typeof(gl[method_name]) != 'function' && !/[a-z]/.test(method_name)) // no lowercase letters
        Jax.getGlobal()[('GL_'+method_name)] = gl[method_name];

    /* define some extra globals that the above didn't generate */
    Jax.getGlobal()['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    Jax.getGlobal()['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) Jax.getGlobal()['GL_TEXTURES'][i] = gl["TEXTURE"+i];
    Jax.getGlobal()['GL_MAX_ACTIVE_TEXTURES'] = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  }

  Jax.getGlobal()['GL'] = gl;

  Jax.getGlobal()['WEBGL_CLEANUP'] = function() {
    // remove the temporary GL context that will no longer be used
    delete Jax.getGlobal()['GL'];
    delete Jax.getGlobal()['WEBGL_CLEANUP'];
  };
})();
