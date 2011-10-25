/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */

//= require "jax/vendor/glMatrix"
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
  // canvas.style.display = "block";

  // var body = document.getElementsByTagName("body")[0], temporaryBody = false;
  // if (!body)
  // {
  //   temporaryBody = true;
  //   body = document.createElement("body");
  //   document.getElementsByTagName("html")[0].appendChild(body);
  // }
  // body.appendChild(canvas);

  try {
    var gl = canvas.getContext(WEBGL_CONTEXT_NAME);
  } catch(e) {
    // these are now handled by the Context upon initialization.
    // document.location.pathname = "/webgl_not_supported.html";
    // throw new Error("WebGL is disabled or is not supported by this browser!");
    gl = null;
  }

  if (gl) {
    for (var method_name in gl)
    {
      if (typeof(gl[method_name]) == "function")
      {
        var camelized_method_name = method_name.substring(1, method_name.length);
        camelized_method_name = "gl" + method_name.substring(0, 1).toUpperCase() + camelized_method_name;

        /* we'll add a layer here to check for render errors, only in development mode */
        /* FIXME Chrome has serious performance issues related to gl.getError(). Disabling under Chrome for now. */
        var func = "(function "+camelized_method_name+"() {"
                 + "  var result;"
                 + "  if ("+(method_name == 'getError')+" || Jax.environment == Jax.PRODUCTION)"
                 + "    result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + "  else {"
                 + "    try { "
                 + "      result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + "      if ("+(navigator.userAgent.toLowerCase().indexOf('chrome') == -1)+")"
                 + "        this.checkForRenderErrors();"
                 + "    } catch(e) { "
                 + "      var args = [], i;"
                 + "      for (i = 0; i < arguments.length; i++) args.push(arguments[i]);"
                 + "      try { args = JSON.stringify(args); } catch(jsonErr) { args = args.toString(); }"
                 + "      if (!e.stack) e = new Error(e.toString());"
                 + "      this.handleRenderError('"+method_name+"', args, e);"
                 + "    }"
                 + "  }"
                 + "  return result;"
                 + "})";

        GL_METHODS[camelized_method_name] = eval("("+func+")");
      }
      else
      {
        /* define the GL enums Jax.getGlobal()ly so we don't need a context to reference them */
        if (!/[a-z]/.test(method_name)) // no lowercase letters
          Jax.getGlobal()[('GL_'+method_name)] = gl[method_name];
      }
    }

    /* define some extra Jax.getGlobal()s that the above didn't generate */
//    Jax.getGlobal()['GL_MAX_VERTEX_ATTRIBS'] = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    Jax.getGlobal()['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    Jax.getGlobal()['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) Jax.getGlobal()['GL_TEXTURES'][i] = gl["TEXTURE"+i];
    Jax.getGlobal()['GL_MAX_ACTIVE_TEXTURES'] = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  }

  Jax.getGlobal()['GL'] = gl;

  Jax.getGlobal()['WEBGL_CLEANUP'] = function() {
    /* clean up after ourselves */
    // if (temporaryBody)
    //   body.parentNode.removeChild(body);
    // else
    //   body.removeChild(canvas);
      
    // remove the temporary GL context that will no longer be used
    delete Jax.getGlobal()['GL'];
    delete Jax.getGlobal()['WEBGL_CLEANUP'];
  };
})();
