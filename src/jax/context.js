//= require "webgl"
//= require "events"

/**
 * class Jax.Context
 * The highest level of operation in Jax. Initialization is simple:
 * 
 *     var context = new Jax.Context(canvas);
 *     
 * where _canvas_ is a reference to an HTML5 Canvas element.
 * 
 * If there is a root route set up, then at this point you are done.
 * If not, there's an additional step:
 * 
 *     context.redirect_to("controller_name/action_name");
 *     
 * where *controller_name* is the short name of the controller to start at,
 * and *action_name* is the action to fire within that controller.
 * 
 * Note that the specified redirect path must be registered in the route set.
 * 
 * Jax will automatically initialize and maintain a WebGL rendering bridge,
 * and WebGL methods can be called directly on this context by prefixing
 * the name of the method with "gl". For example:
 * 
 *     context.glClear(GL_COLOR_BIT | GL_DEPTH_BUFFER_BIT);
 * 
 **/
Jax.Context = (function() {
  function setupContext(self) {
    try { self.gl = self.canvas.getContext(WEBGL_CONTEXT_NAME); } catch(e) { }
    if (!self.gl) throw new Error("WebGL could not be initialized!");
  }
  
  function startRendering(self) {
    function render() {
      if (self.current_view) {
        reloadMatrices(self);
        self.glViewport(0, 0, self.canvas.width, self.canvas.height);
        self.current_view.render();
        self.render_interval = requestAnimFrame(render, self.canvas);
      }
      else {
        clearTimeout(self.render_interval);
        self.render_interval = null;
      }
    }
    
    self.render_interval = setTimeout(render, Jax.render_speed);
  }
  
  function setupView(self, view) {
    view.context = self;
    view.world = self.world;
    view.player = self.player;
    for (var i in self) {
      if (i.indexOf("gl") == 0) {
        /* it's a WebGL method */
        view[i] = eval("(function() { return this.context."+i+".apply(this.context, arguments); })");
      }
    }
    /* TODO we should set up helpers, etc. here too */
  }
  
  function reloadMatrices(self) {
    mat4.set(self.player.camera.getModelViewMatrix(), self.getModelViewMatrix());

    // in case someone wiser than I reads this, let me know: WHY do I have to invert the camera matrix???
    mat4.inverse(self.matrices[self.matrix_depth]);
  }
  
  return Jax.Class.create({
    initialize: function(canvas) {
      this.id = ++Jax.Context.identifier;
      this.canvas = canvas;
      setupContext(this);
      this.setupEventListeners();
      this.render_interval = null;
      this.glClearColor(0.0, 0.0, 0.0, 1.0);
      this.glClearDepth(1.0);
      this.glEnable(GL_DEPTH_TEST);
      this.glDepthFunc(GL_LEQUAL);
      this.glEnable(GL_BLEND);
      this.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      this.checkForRenderErrors();
      this.world = new Jax.World(this);
      this.player = {camera: new Jax.Camera()};
      this.player.camera.perspective({width:canvas.width, height:canvas.height});
      
      this.matrices = [mat4.create()];
      mat4.set(this.player.camera.getModelViewMatrix(), this.matrices[0]);
      this.matrix_depth = 0;
      
      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");
    },

    /**
     * Jax.Context#redirectTo(path) -> Controller
     * - path (String): the path to redirect to
     * 
     * Redirects to the specified route, and then returns the Jax.Controller that
     * was just redirected to.
     **/
    redirectTo: function(path) {
      this.current_controller = Jax.routes.dispatch(path, this);
      if (!this.current_controller.view_key)
        throw new Error("Controller '"+this.current_controller.getControllerName()+"' did not produce a renderable result");
      this.current_view = Jax.views.find(this.current_controller.view_key);
      setupView(this, this.current_view);
      if (!this.isRendering()) startRendering(this);
    },

    /**
     * Jax.Context#isRendering() -> Boolean
     * Returns true if this Jax.Context currently has a render interval set.
     * This will be false by default if there is no root route; otherwise
     * it will be true. It is also enabled automatically upon the first
     * valid redirect.
     **/
    isRendering: function() {
      return this.render_interval != null;
    },

    /**
     * Jax.Context#dispose() -> undefined
     *
     * Permanently disposes of this context, freeing the resources it is using.
     * This stops actions from running, closes any open rendering contexts, and
     * clears all other timeouts and intervals.
     *
     * A Jax.Context cannot be used once it is disposed.
     **/
    dispose: function() {
      this.disposed = true;
    },

    /**
     * Jax.Context#isDisposed() -> Boolean
     * Returns true if this context has been disposed.
     **/
    isDisposed: function() {
      return !!this.disposed;
    },
    
    pushMatrix: function(yield_to) {
      var current = this.getModelViewMatrix();
      this.matrix_depth++;
      if (!this.matrices[this.matrix_depth]) this.matrices[this.matrix_depth] = mat4.create();
      mat4.set(current, this.matrices[this.matrix_depth]);
      yield_to();
      this.matrix_depth--;
    },
    
    multMatrix: function(matr) {
      mat4.multiply(this.getModelViewMatrix(), matr);
    },
    
    /**
     * Jax.Context#getFrustum() -> Jax.Scene.Frustum
     * Returns the frustum for the player's camera. Equivalent to calling
     * 
     *     context.player.camera.getFrustum()
     *     
     * Note that changes to the matrix via #multMatrix will not be represented
     * in this Jax.Scene.Frustum.
     **/
    getFrustum: function() { return this.player.camera.frustum; },
  
    /**
     * Jax.Context#getModelViewMatrix() -> Matrix
     * Returns the current modelview matrix.
     **/
    getModelViewMatrix: function() { return this.matrices[this.matrix_depth]; },
    
    /**
     * Jax.Context#getProjectionMatrix() -> Matrix
     * Returns the current projection matrix.
     **/
    getProjectionMatrix: function() { return this.player.camera.getProjectionMatrix(); },

    /**
     * Jax.Context#getNormalMatrix() -> Matrix
     * Returns the current projection matrix.
     **/
    getNormalMatrix: function() {
      var mat = mat4.create();
      mat4.inverse(this.getModelViewMatrix(), mat);
      mat4.transpose(mat);
      return mat;
      //return this.player.camera.getNormalMatrix(); },
    },

    checkForRenderErrors: function() {
      /* Error checking is slow, so don't do it in production mode */
      if (Jax.environment == "production") return; /* TODO expose Jax.environment to application */

      var error = this.glGetError();
      if (error != GL_NO_ERROR)
      {
        var str = "GL error in "+this.canvas.id+": "+error;
        error = new Error(str);
        var message = error;
        if (error.stack)
        {
          var stack = error.stack.split("\n");
          stack.shift();
          message += "\n\n"+stack.join("\n");
        }
        
        throw error;
      }
    },
    
    handleRenderError: function(method_name, args, err) {
      throw err;
    }
  });
})();

Jax.Context.identifier = 0;
Jax.Context.addMethods(GL_METHODS);
Jax.Context.addMethods(Jax.EVENT_METHODS);
