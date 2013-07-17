((function() {
  function messageFor(owner, newProp, oldProp) {
    if (newProp) {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please use `"+owner.name+"#"+newProp.replace(/\./g, '#')+"` instead.";
    } else {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please see the documentation.";
    }
  }

  function createDelegator(oldProp, newProp, message) {
    var setter = false;
    if (newProp) {
      setter = newProp.charAt(newProp.length-1) === '=';
      newProp = newProp.replace(/=$/, '');
    }
    
    return (function() {
      var _value;
      var src = this;
      if (newProp) {
        var prop = newProp.split('.');
        while (prop.length > 1) {
          src = src[prop.shift()];
          if (src === undefined) throw new Error(message);
        }
        prop = prop[0]
        _value = src[prop]
        if (Jax.deprecate.level > 0) console.log(new Error(message).stack);
        else console.log(message);
        if (_value instanceof Function)
          return _value.apply(this, arguments);
        else {
          if (setter)
            if (arguments.length > 1)
              return src[prop] = arguments;
            else
              return src[prop] = arguments[0];
          else
            return _value;
        }
      } else {
        throw new Error(message);
      }
    });
  }

  Jax.deprecate = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    _proto[oldProp] = delegator;
  };

  Jax.deprecateProperty = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    Object.defineProperty(_proto, oldProp, {
      get: delegator,
      set: delegator
    });
  };
})());

Jax.deprecate.level = 1;

if (Jax.Camera) {
  Jax.deprecate(Jax.Camera, 'getFrustum', 'frustum');
  Jax.deprecate(Jax.Camera, 'getPosition', 'position');
  Jax.deprecate(Jax.Camera, 'getDirection', 'direction');
  Jax.deprecate(Jax.Camera, 'getViewVector', 'direction');
  Jax.deprecate(Jax.Camera, 'getRightVector', 'right');
  Jax.deprecate(Jax.Camera, 'getUpVector', 'up');
  Jax.deprecate(Jax.Camera, 'setDirection', 'direction=');
  Jax.deprecate(Jax.Camera, 'setViewVector', 'direction=');
  Jax.deprecate(Jax.Camera, 'setPosition', 'position=');
  /** deprecated
   * Jax.Camera#orient(viewVector, upVector[, positionVector]) -> Jax.Camera
   * - viewVector (vec3): the new direction that the camera will be pointing
   * - upVector (vec3): the new "up" direction perpendicular to the view
   * - positionVector (vec3): optionally, a new position for the camera
   * Jax.Camera#orient(vx, vy, vz, ux, uy, uz[, px, py, pz]) -> Jax.Camera
   * 
   * Reorients this camera to be looking in the specified direction.
   * Optionally, repositions this camera.
   *
   * **Deprecated.** Please use Jax.Camera#setDirection instead.
   **/
  Jax.deprecate(Jax.Camera, 'orient', 'reorient');

}

/** deprecated
 * Jax.World#addLightSource(light) -> Jax.Scene.LightSource
 * - light (Jax.Scene.LightSource): the instance of Jax.Scene.LightSource to add to this world.
 *
 * Adds the light to the world and then returns the light itself unchanged.
 * Deprecated: use `Jax.World#addLight` instead.
 **/
if (Jax.World) {
  Jax.deprecate(Jax.World, 'addLightSource', 'addLight');
}

if (Jax.Light) {
  Jax.deprecate(Jax.Light, 'getPosition', 'position');
  Jax.deprecate(Jax.Light, 'castShadows', 'shadows');
}

if (Jax.Model) {
  Jax.deprecate(Jax.Model, 'lit', 'illuminated');
  Jax.deprecate(Jax.Model, 'shadow_caster', 'castShadow and receiveShadow');
}

if (Jax.Mesh) {
  if (Jax.Mesh.Base) {
    Jax.deprecate(Jax.Mesh.Base, 'getVertexBuffer', 'data.set(vars, {vertices: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getNormalBuffer', 'data.set(vars, {normals: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getColorBuffer', 'data.set(vars, {colors: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTextureCoordsBuffer', 'data.set(vars, {texture: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTangentBuffer', 'data.set(vars, {tangents: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTriangles', 'eachTriangle(callback)');
  }

  if (Jax.Mesh.Triangles) {
    Jax.deprecate(Jax.Mesh.Triangles, 'getVertexBuffer', 'data.set(vars, {vertices: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getNormalBuffer', 'data.set(vars, {normals: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getColorBuffer', 'data.set(vars, {colors: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getTextureCoordsBuffer', 'data.set(vars, {texture: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getTangentBuffer', 'data.set(vars, {tangents: "shaderVariableName"})');
  }
}

if (Jax.View) {
  Jax.deprecateProperty(Jax.View, 'gl', 'context.gl', 'The @gl property of Jax views has been deprecated. Please use @context.renderer instead. If @context.renderer cannot do what you need, then use @context.gl, but bear in mind that this will become a deprecated property sometime in the future, after @context.renderer becomes more capable.');
  Jax.deprecate(Jax.View, 'glClear', 'gl.clear');
}

/** deprecated
 * Jax.RouteSet#root(controller, actionName) -> undefined
 * - controller (Jax.Controller): the controller that will be routed to
 * - actionName (String): the name of the action to be invoked by this route
 * 
 * Note that the controller is expected to be a subclass of Jax.Controller.
 * 
 * Example:
 * 
 *     Jax.routes.root(WelcomeController, "index");
 * 
 **/
if (Jax.RouteSet) {
  Jax.deprecate(Jax.RouteSet, 'root', null, 
    "Jax.RouteSet#root is deprecated. Instead, please use\n" +
    "  `new Jax.Context(canvas, {root:'controller/action'})`\n"+
    "or redirect explicitly with \n"+
    "  `context.redirectTo('controller/action')`"
  );
}

if (Jax.Framebuffer) {
  /** deprecated
   * Jax.Framebuffer#getTextureBuffer(context, index) -> Jax.Texture
   *
   * This method is deprecated. See Jax.Framebuffer#getTexture instead.
   **/
  Jax.deprecate(Jax.Framebuffer, 'getTextureBuffer', 'getTexture');

  /** deprecated
   * Jax.Framebuffer#getTextureBufferHandle(context, index) -> WebGLTexture
   *
   * This method is deprecated. See Jax.Framebuffer#getTextureHandle instead.
   **/
  Jax.deprecate(Jax.Framebuffer, 'getTextureBufferHandle', 'getTextureHandle');
}

if (Jax.Context) {
  Jax.deprecate(Jax.Context, 'getUpdatesPerSecond');
  Jax.deprecate(Jax.Context, 'disableUpdateSpeedCalculations');
  Jax.deprecate(Jax.Context, 'loadModelMatrix', 'matrix_stack.loadModelMatrix');
  Jax.deprecate(Jax.Context, 'loadViewMatrix', 'matrix_stack.loadViewMatrix');
  Jax.deprecate(Jax.Context, 'loadProjectionMatrix', 'matrix_stack.loadProjectionMatrix');
  Jax.deprecate(Jax.Context, 'multModelMatrix', 'matrix_stack.multModelMatrix');
  Jax.deprecate(Jax.Context, 'multViewMatrix', 'matrix_stack.multViewMatrix');
  Jax.deprecate(Jax.Context, 'multProjectionMatrix', 'matrix_stack.multProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getModelMatrix', 'matrix_stack.getModelMatrix');
  Jax.deprecate(Jax.Context, 'getViewMatrix', 'matrix_stack.getViewMatrix');
  Jax.deprecate(Jax.Context, 'getProjectionMatrix', 'matrix_stack.getProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getInverseModelMatrix', 'matrix_stack.getInverseModelMatrix');
  Jax.deprecate(Jax.Context, 'getNormalMatrix', 'matrix_stack.getNormalMatrix');
  Jax.deprecate(Jax.Context, 'getInverseViewMatrix', 'matrix_stack.getInverseViewMatrix');
  Jax.deprecate(Jax.Context, 'getModelViewMatrix', 'matrix_stack.getModelViewMatrix');
  Jax.deprecate(Jax.Context, 'getInverseModelViewMatrix', 'matrix_stack.getInverseModelViewMatrix');
  Jax.deprecate(Jax.Context, 'getModelViewProjectionMatrix', 'matrix_stack.getModelViewProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getInverseProjectionMatrix', 'matrix_stack.getInverseProjectionMatrix');
  Jax.deprecateProperty(Jax.Context, 'current_controller', 'controller');
  Jax.deprecateProperty(Jax.Context, 'current_view', 'view');
  /** deprecated
   * Jax.Context#afterRender(func) -> Jax.Context
   * 
   * Registers the specified function to be called immediately after every render pass.
   * Returns this context.
   *
   * When the function is called, its +this+ object is set to the context itself.
   **/
  Jax.deprecate(Jax.Context, "afterRender");

  /** deprecated
   * Jax.Context#afterUpdate(func) -> Jax.Context
   *
   * Registers the specified function to be called immediately after every update pass.
   * Returns this context.
   *
   * When the function is called, its +this+ object is set to the context itself.
   **/
  Jax.deprecate(Jax.Context, "afterUpdate");

  Jax.deprecate(Jax.Context, 'glClearColor', 'gl.clearColor');
  Jax.deprecate(Jax.Context, 'glGetContextAttributes', 'gl.getContextAttributes');
  Jax.deprecate(Jax.Context, 'glIsContextLost', 'gl.isContextLost');
  Jax.deprecate(Jax.Context, 'glGetSupportedExtensions', 'gl.getSupportedExtensions');
  Jax.deprecate(Jax.Context, 'glGetExtension', 'gl.getExtension');
  Jax.deprecate(Jax.Context, 'glActiveTexture', 'gl.activeTexture');
  Jax.deprecate(Jax.Context, 'glAttachShader', 'gl.attachShader');
  Jax.deprecate(Jax.Context, 'glBindAttribLocation', 'gl.bindAttribLocation');
  Jax.deprecate(Jax.Context, 'glBindBuffer', 'gl.bindBuffer');
  Jax.deprecate(Jax.Context, 'glBindFramebuffer', 'gl.bindFramebuffer');
  Jax.deprecate(Jax.Context, 'glBindRenderbuffer', 'gl.bindRenderbuffer');
  Jax.deprecate(Jax.Context, 'glBindTexture', 'gl.bindTexture');
  Jax.deprecate(Jax.Context, 'glBlendColor', 'gl.blendColor');
  Jax.deprecate(Jax.Context, 'glBlendEquation', 'gl.blendEquation');
  Jax.deprecate(Jax.Context, 'glBlendEquationSeparate', 'gl.blendEquationSeparate');
  Jax.deprecate(Jax.Context, 'glBlendFunc', 'gl.blendFunc');
  Jax.deprecate(Jax.Context, 'glBlendFuncSeparate', 'gl.blendFuncSeparate');
  Jax.deprecate(Jax.Context, 'glBufferData', 'gl.bufferData');
  Jax.deprecate(Jax.Context, 'glBufferSubData', 'gl.bufferSubData');
  Jax.deprecate(Jax.Context, 'glCheckFramebufferStatus', 'gl.checkFramebufferStatus');
  Jax.deprecate(Jax.Context, 'glClear', 'gl.clear');
  Jax.deprecate(Jax.Context, 'glClearColor', 'gl.clearColor');
  Jax.deprecate(Jax.Context, 'glClearDepth', 'gl.clearDepth');
  Jax.deprecate(Jax.Context, 'glClearStencil', 'gl.clearStencil');
  Jax.deprecate(Jax.Context, 'glColorMask', 'gl.colorMask');
  Jax.deprecate(Jax.Context, 'glCompileShader', 'gl.compileShader');
  Jax.deprecate(Jax.Context, 'glCompressedTexImage2D', 'gl.compressedTexImage2D');
  Jax.deprecate(Jax.Context, 'glCompressedTexSubImage2D', 'gl.compressedTexSubImage2D');
  Jax.deprecate(Jax.Context, 'glCopyTexImage2D', 'gl.copyTexImage2D');
  Jax.deprecate(Jax.Context, 'glCopyTexSubImage2D', 'gl.copyTexSubImage2D');
  Jax.deprecate(Jax.Context, 'glCreateBuffer', 'gl.createBuffer');
  Jax.deprecate(Jax.Context, 'glCreateFramebuffer', 'gl.createFramebuffer');
  Jax.deprecate(Jax.Context, 'glCreateProgram', 'gl.createProgram');
  Jax.deprecate(Jax.Context, 'glCreateRenderbuffer', 'gl.createRenderbuffer');
  Jax.deprecate(Jax.Context, 'glCreateShader', 'gl.createShader');
  Jax.deprecate(Jax.Context, 'glCreateTexture', 'gl.createTexture');
  Jax.deprecate(Jax.Context, 'glCullFace', 'gl.cullFace');
  Jax.deprecate(Jax.Context, 'glDeleteBuffer', 'gl.deleteBuffer');
  Jax.deprecate(Jax.Context, 'glDeleteFramebuffer', 'gl.deleteFramebuffer');
  Jax.deprecate(Jax.Context, 'glDeleteProgram', 'gl.deleteProgram');
  Jax.deprecate(Jax.Context, 'glDeleteRenderbuffer', 'gl.deleteRenderbuffer');
  Jax.deprecate(Jax.Context, 'glDeleteShader', 'gl.deleteShader');
  Jax.deprecate(Jax.Context, 'glDeleteTexture', 'gl.deleteTexture');
  Jax.deprecate(Jax.Context, 'glDepthFunc', 'gl.depthFunc');
  Jax.deprecate(Jax.Context, 'glDepthMask', 'gl.depthMask');
  Jax.deprecate(Jax.Context, 'glDetachShader', 'gl.detachShader');
  Jax.deprecate(Jax.Context, 'glDisable', 'gl.disable');
  Jax.deprecate(Jax.Context, 'glDisableVertexAttribArray', 'gl.disableVertexAttribArray');
  Jax.deprecate(Jax.Context, 'glDrawArrays', 'gl.drawArrays');
  Jax.deprecate(Jax.Context, 'glDrawElements', 'gl.drawElements');
  Jax.deprecate(Jax.Context, 'glEnable', 'gl.enable');
  Jax.deprecate(Jax.Context, 'glEnableVertexAttribArray', 'gl.enableVertexAttribArray');
  Jax.deprecate(Jax.Context, 'glFinish', 'gl.finish');
  Jax.deprecate(Jax.Context, 'glFlush', 'gl.flush');
  Jax.deprecate(Jax.Context, 'glFramebufferRenderbuffer', 'gl.framebufferRenderbuffer');
  Jax.deprecate(Jax.Context, 'glFramebufferTexture2D', 'gl.framebufferTexture2D');
  Jax.deprecate(Jax.Context, 'glFrontFace', 'gl.frontFace');
  Jax.deprecate(Jax.Context, 'glGenerateMipmap', 'gl.generateMipmap');
  Jax.deprecate(Jax.Context, 'glGetActiveAttrib', 'gl.getActiveAttrib');
  Jax.deprecate(Jax.Context, 'glGetActiveUniform', 'gl.getActiveUniform');
  Jax.deprecate(Jax.Context, 'glGetAttachedShaders', 'gl.getAttachedShaders');
  Jax.deprecate(Jax.Context, 'glGetAttribLocation', 'gl.getAttribLocation');
  Jax.deprecate(Jax.Context, 'glGetBufferParameter', 'gl.getBufferParameter');
  Jax.deprecate(Jax.Context, 'glGetParameter', 'gl.getParameter');
  Jax.deprecate(Jax.Context, 'glGetError', 'gl.getError');
  Jax.deprecate(Jax.Context, 'glGetFramebufferAttachmentParameter', 'gl.getFramebufferAttachmentParameter');
  Jax.deprecate(Jax.Context, 'glGetProgramParameter', 'gl.getProgramParameter');
  Jax.deprecate(Jax.Context, 'glGetProgramInfoLog', 'gl.getProgramInfoLog');
  Jax.deprecate(Jax.Context, 'glGetRenderbufferParameter', 'gl.getRenderbufferParameter');
  Jax.deprecate(Jax.Context, 'glGetShaderParameter', 'gl.getShaderParameter');
  Jax.deprecate(Jax.Context, 'glGetShaderPrecisionFormat', 'gl.getShaderPrecisionFormat');
  Jax.deprecate(Jax.Context, 'glGetShaderInfoLog', 'gl.getShaderInfoLog');
  Jax.deprecate(Jax.Context, 'glGetShaderSource', 'gl.getShaderSource');
  Jax.deprecate(Jax.Context, 'glGetTexParameter', 'gl.getTexParameter');
  Jax.deprecate(Jax.Context, 'glGetUniform', 'gl.getUniform');
  Jax.deprecate(Jax.Context, 'glGetUniformLocation', 'gl.getUniformLocation');
  Jax.deprecate(Jax.Context, 'glGetVertexAttrib', 'gl.getVertexAttrib');
  Jax.deprecate(Jax.Context, 'glGetVertexAttribOffset', 'gl.getVertexAttribOffset');
  Jax.deprecate(Jax.Context, 'glHint', 'gl.hint');
  Jax.deprecate(Jax.Context, 'glIsBuffer', 'gl.isBuffer');
  Jax.deprecate(Jax.Context, 'glIsEnabled', 'gl.isEnabled');
  Jax.deprecate(Jax.Context, 'glIsFramebuffer', 'gl.isFramebuffer');
  Jax.deprecate(Jax.Context, 'glIsProgram', 'gl.isProgram');
  Jax.deprecate(Jax.Context, 'glIsRenderbuffer', 'gl.isRenderbuffer');
  Jax.deprecate(Jax.Context, 'glIsShader', 'gl.isShader');
  Jax.deprecate(Jax.Context, 'glIsTexture', 'gl.isTexture');
  Jax.deprecate(Jax.Context, 'glLineWidth', 'gl.lineWidth');
  Jax.deprecate(Jax.Context, 'glLinkProgram', 'gl.linkProgram');
  Jax.deprecate(Jax.Context, 'glPixelStorei', 'gl.pixelStorei');
  Jax.deprecate(Jax.Context, 'glPolygonOffset', 'gl.polygonOffset');
  Jax.deprecate(Jax.Context, 'glReadPixels', 'gl.readPixels');
  Jax.deprecate(Jax.Context, 'glRenderbufferStorage', 'gl.renderbufferStorage');
  Jax.deprecate(Jax.Context, 'glSampleCoverage', 'gl.sampleCoverage');
  Jax.deprecate(Jax.Context, 'glScissor', 'gl.scissor');
  Jax.deprecate(Jax.Context, 'glShaderSource', 'gl.shaderSource');
  Jax.deprecate(Jax.Context, 'glStencilFunc', 'gl.stencilFunc');
  Jax.deprecate(Jax.Context, 'glStencilFuncSeparate', 'gl.stencilFuncSeparate');
  Jax.deprecate(Jax.Context, 'glStencilMask', 'gl.stencilMask');
  Jax.deprecate(Jax.Context, 'glStencilMaskSeparate', 'gl.stencilMaskSeparate');
  Jax.deprecate(Jax.Context, 'glStencilOp', 'gl.stencilOp');
  Jax.deprecate(Jax.Context, 'glStencilOpSeparate', 'gl.stencilOpSeparate');
  Jax.deprecate(Jax.Context, 'glTexImage2D', 'gl.texImage2D');
  Jax.deprecate(Jax.Context, 'glTexParameterf', 'gl.texParameterf');
  Jax.deprecate(Jax.Context, 'glTexParameteri', 'gl.texParameteri');
  Jax.deprecate(Jax.Context, 'glTexSubImage2D', 'gl.texSubImage2D');
  Jax.deprecate(Jax.Context, 'glUniform1f', 'gl.uniform1f');
  Jax.deprecate(Jax.Context, 'glUniform1fv', 'gl.uniform1fv');
  Jax.deprecate(Jax.Context, 'glUniform1i', 'gl.uniform1i');
  Jax.deprecate(Jax.Context, 'glUniform1iv', 'gl.uniform1iv');
  Jax.deprecate(Jax.Context, 'glUniform2f', 'gl.uniform2f');
  Jax.deprecate(Jax.Context, 'glUniform2fv', 'gl.uniform2fv');
  Jax.deprecate(Jax.Context, 'glUniform2i', 'gl.uniform2i');
  Jax.deprecate(Jax.Context, 'glUniform2iv', 'gl.uniform2iv');
  Jax.deprecate(Jax.Context, 'glUniform3f', 'gl.uniform3f');
  Jax.deprecate(Jax.Context, 'glUniform3fv', 'gl.uniform3fv');
  Jax.deprecate(Jax.Context, 'glUniform3i', 'gl.uniform3i');
  Jax.deprecate(Jax.Context, 'glUniform3iv', 'gl.uniform3iv');
  Jax.deprecate(Jax.Context, 'glUniform4f', 'gl.uniform4f');
  Jax.deprecate(Jax.Context, 'glUniform4fv', 'gl.uniform4fv');
  Jax.deprecate(Jax.Context, 'glUniform4i', 'gl.uniform4i');
  Jax.deprecate(Jax.Context, 'glUniform4iv', 'gl.uniform4iv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix2fv', 'gl.uniformMatrix2fv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix3fv', 'gl.uniformMatrix3fv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix4fv', 'gl.uniformMatrix4fv');
  Jax.deprecate(Jax.Context, 'glUseProgram', 'gl.useProgram');
  Jax.deprecate(Jax.Context, 'glValidateProgram', 'gl.validateProgram');
  Jax.deprecate(Jax.Context, 'glVertexAttrib1f', 'gl.vertexAttrib1f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib1fv', 'gl.vertexAttrib1fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib2f', 'gl.vertexAttrib2f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib2fv', 'gl.vertexAttrib2fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib3f', 'gl.vertexAttrib3f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib3fv', 'gl.vertexAttrib3fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib4f', 'gl.vertexAttrib4f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib4fv', 'gl.vertexAttrib4fv');
  Jax.deprecate(Jax.Context, 'glVertexAttribPointer', 'gl.vertexAttribPointer');
  Jax.deprecate(Jax.Context, 'glViewport', 'gl.viewport');
}
