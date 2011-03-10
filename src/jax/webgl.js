/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */

window['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
window['GL_METHODS'] = {};

(function() {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "temporary-internal-use");
  canvas.style.display = "block";

  var body = document.getElementsByTagName("body")[0], temporaryBody = false;
  if (!body)
  {
    temporaryBody = true;
    body = document.createElement("body");
    document.getElementsByTagName("html")[0].appendChild(body);
  }
  body.appendChild(canvas);

  var gl = canvas.getContext(WEBGL_CONTEXT_NAME);

  if (gl) {
    for (var method_name in gl)
    {
      if (typeof(gl[method_name]) == "function")
      {
        var camelized_method_name = method_name.substring(1, method_name.length);
        camelized_method_name = "gl" + method_name.substring(0, 1).toUpperCase() + camelized_method_name;

        /* we'll add a layer here to check for render errors */
        var func = "function() {"
                 + "  var result;"
                 + "  try { "
                 + "    result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + ((method_name != "getError") ? "    this.checkForRenderErrors();" : "")
                 + "  } catch(e) { "
                 + "    var args = [], i;"
                 + "    for (i = 0; i < arguments.length; i++) args.push(arguments[i]);"
                 + "    args = JSON.stringify(args);"
                 + "    if (!e.stack) e = new Error(e.toString());"
                 + "    this.handleRenderError('"+method_name+"', args, e);"
                 + "  }"
                 + "  return result;"
                 + "}";

        GL_METHODS[camelized_method_name] = eval("("+func+")");
      }
      else
      {
        /* define the GL enums globally so we don't need a context to reference them */
        if (!/[a-z]/.test(method_name)) // no lowercase letters
          window[('GL_'+method_name)] = gl[method_name];
      }
    }

    /* define some extra globals that the above didn't generate */
    window['GL_MAX_VERTEX_ATTRIBS'] = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    window['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    window['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) window['GL_TEXTURES'][i] = gl["TEXTURE"+i];
  }
  
  /* clean up after ourselves */
  if (temporaryBody)
    body.parentNode.removeChild(body);
})();

/* import other webgl files */
//= require "webgl/buffer"
//= require "webgl/material"
