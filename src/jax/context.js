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
    try { self.gl = self.canvas.getContext(WEBGL_CONTEXT_NAME, WEBGL_CONTEXT_OPTIONS); } catch(e) { }
    if (!self.gl) throw new Error("WebGL could not be initialized!");
    
    if (!self.canvas.eventListeners) {
      /* TODO merge this with jax/webgl/core/events.js and use for all Jax event handling */
      self.canvas.eventListeners = {};
      var _add = self.canvas.addEventListener, _remove = self.canvas.removeEventListener;
      
      self.canvas.getEventListeners = function(type) {
        if (type) return (this.eventListeners[type] = this.eventListeners[type] || []);
        else {
          var ret = [];
          for (var i in this.eventListeners) ret = ret.concat(this.eventListeners[i]);
          return ret;
        }
      };
      
      self.canvas.addEventListener = function(type, listener, capture) {
        this.getEventListeners(type).push(listener);
        _add.apply(this, arguments);
      }
      
      self.canvas.removeEventListener = function(type, listener, capture) {
        if (typeof(type) == "string") {
          var listeners = this.getEventListeners(type);
          var index = listeners.indexOf(listener);
          if (index != -1) listeners.splice(index, 1);
        } else if (!listener) {
          // type *is* the listener, remove it from all arrays
          for (var i in this.eventListeners)
            this.removeEventListener(i, type);
          return;
        }
        _remove.apply(this, arguments);
      };
    }
  }
  
  function updateFramerate(self) {
    var current_render_start = Jax.uptime;
    if (!self.last_render_start) self.last_render_start = Jax.uptime;
    var time_to_render_this_frame = current_render_start - self.last_render_start;
    
    self.time_to_render = (self.time_to_render || 0) * self.framerate_sample_ratio
                        + time_to_render_this_frame * (1 - self.framerate_sample_ratio);
    
    // frames per second = 1 second divided by time to render; time is currently in ms so 1sec = 1000ms
    self.framerate = self.frames_per_second = 1.0 / self.time_to_render;
    self.last_render_start = current_render_start;
  }
  
  function updateUpdateRate(self) {
    var current_update_start = Jax.uptime;
    if (!self.last_update_start) self.last_update_start = current_update_start;
    var time_to_update_this_frame = current_update_start - self.last_update_start;
    
    if (self.calculateUpdateRate) {
      self.time_to_update = (self.time_to_update || 0) * self.framerate_sample_ratio
                          + time_to_update_this_frame * (1 - self.framerate_sample_ratio);
                        
      // update rate = seconds / time
      self.updates_per_second = 1.0 / self.time_to_update;
    }
    
    // in order to avoid recalculating the above for updates, we'll return the timechange
    // to be used in subsequent updates.
    var timechange = current_update_start - self.last_update_start;
    self.last_update_start = current_update_start;
    return timechange;
  }
  
  function startRendering(self) {
    function render() {
      if (self.isDisposed()) return;
      if (self.calculateFramerate) updateFramerate(self);
      if (self.current_view) {
        self.prepare();
        self.current_view.render();
        var len = self.afterRenderFuncs.length;
        for (var i = 0; i < len; i++) self.afterRenderFuncs[i].call(self);
        self.render_interval = requestAnimFrame(render, self.canvas);
      }
      else {
        clearTimeout(self.render_interval);
        self.render_interval = null;
      }
    }
    
    self.render_interval = setTimeout(render, Jax.render_speed);
  }
  
  function stopRendering(self) {
    clearTimeout(self.render_interval);
  }
  
  function startUpdating(self) {
    function updateFunc() {
      if (self.isDisposed()) return;
      var timechange = updateUpdateRate(self);
      
      self.update(timechange);
      var len = self.afterUpdateFuncs.length;
      for (var i = 0; i < len; i++) self.afterUpdateFuncs[i].call(self);
      self.update_interval = setTimeout(updateFunc, Jax.update_speed);
      
      if (Jax.SHUTDOWN_IN_PROGRESS) self.dispose();
    }
    updateFunc();
  }
  
  function stopUpdating(self) {
    clearTimeout(self.update_interval);
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
    self.matrix_stack.reset(); // reset depth
    self.matrix_stack.loadModelMatrix(Jax.IDENTITY_MATRIX);
    self.matrix_stack.loadViewMatrix(self.player.camera.getTransformationMatrix());
    self.matrix_stack.loadProjectionMatrix(self.player.camera.getProjectionMatrix());
  }
  
  var klass = Jax.Class.create({
    initialize: function(canvas) {
      if (typeof(canvas) == "string") canvas = document.getElementById(canvas);
      if (!canvas) throw new Error("Can't initialize a WebGL context without a canvas!");
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
      this.matrix_stack = new Jax.MatrixStack();
      this.current_pass = Jax.Scene.AMBIENT_PASS;
      this.afterRenderFuncs = [];
      this.afterUpdateFuncs = [];
      this.framerate = 0;
      this.frames_per_second = 0;
      this.updates_per_second = 0;
      
      /**
       * Jax.Context#framerate_sample_ratio -> Number
       *
       * A number between 0 and 1, to be used in updates to frames per second and updates per second.
       *
       * Setting this to a high value will produce "smoother" results; they will change less frequently,
       * but it will take longer to get initial results. High values are better for testing framerate
       * over the long term, while lower values are better for testing small disruptions in framerate
       * (such as garbage collection).
       *
       * Defaults to 0.9.
       **/
      this.framerate_sample_ratio = 0.9;
      
      startUpdating(this);
      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");
    },
    
    /**
     * Jax.Context#getFramesPerSecond() -> Number
     * The average number of frames rendered in one second.
     *
     * Implicitly enables calculation of frames-per-second, which is initially disabled by default
     * to improve performance.
     **/
    getFramesPerSecond: function() { this.calculateFramerate = true; return this.frames_per_second; },
     
    /**
     * Jax.Context#getUpdatesPerSecond() -> Number
     * The average number of updates performed in one second. See also Jax.Context#getFramesPerSecond().
     *
     * Implicitly enables calculation of updates-per-second, which is initially disabled by default
     * to improve performance.
     **/
    getUpdatesPerSecond: function() { this.calculateUpdateRate = true; return this.updates_per_second; },
    
    /**
     * Jax.Context#disableFrameSpeedCalculations() -> Jax.Context
     * Disables calculation of frames-per-second. Note that this calculation is disabled by default
     * to improve performance, so you should only need to call this if you've previously called
     * Jax.Context#getUpdatesPerSecond().
     **/
    disableFrameSpeedCalculations: function() { this.calculateFramerate = false; },
    
    /**
     * Jax.Context#disableUpdateSpeedCalculations() -> Jax.Context
     * Disables calculation of updates-per-second. Note that this calculation is disabled by default
     * to improve performance, so you should only need to call this if you've previously called
     * Jax.Context#getUpdatesPerSecond().
     **/
    disableUpdateSpeedCalculations: function() { this.caclulateUpdateRate = false; },
     
    /**
     * Jax.Context#afterRender(func) -> Jax.Context
     * 
     * Registers the specified function to be called immediately after every render pass.
     * Returns this context.
     *
     * When the function is called, its +this+ object is set to the context itself.
     **/
    afterRender: function(func) {
      this.afterRenderFuncs.push(func);
    },
    
    /**
     * Jax.Context#afterUpdate(func) -> Jax.Context
     *
     * Registers the specified function to be called immediately after every update pass.
     * Returns this context.
     *
     * When the function is called, its +this+ object is set to the context itself.
     **/
    afterUpdate: function(func) {
      this.afterUpdateFuncs.push(func);
    },

    /**
     * Jax.Context#hasStencil() -> Boolean
     *
     * Returns true if this context supports stencil operations.
     **/
    hasStencil: function() {
      return !!this.gl.stencil;
    },

    /**
     * Jax.Context#redirectTo(path) -> Jax.Controller
     * - path (String): the path to redirect to
     * 
     * Redirects to the specified route, and then returns the Jax.Controller that
     * was just redirected to. The act of redirecting will dispose of the current
     * World, so be prepared to initialize a new scene.
     **/
    redirectTo: function(path) {
      stopRendering(this);

      this.world.dispose();
      this.player.camera.reset();
      /* yes, this is necessary. If the routing fails, controller must be null to prevent #update with a new world. */
      this.current_controller = this.current_view = null;
      this.current_controller = Jax.routes.dispatch(path, this);
      if (!this.current_controller.view_key)
        throw new Error("Controller '"+this.current_controller.getControllerName()+"' did not produce a renderable result");
      this.current_view = Jax.views.find(this.current_controller.view_key);
      
      setupView(this, this.current_view);
      if (!this.isRendering()) startRendering(this);
      
      return this.current_controller;
    },
    
    /**
     * Jax.Context#prepare() -> Jax.Context
     * 
     * Loads the matrices from +player.camera+ into the matrix stack, then
     * sets up the viewport. This should be run prior to rendering anything.
     * This is done automatically when the context has a View associated
     * with it, but if there is no View then the render process will be
     * halted, leaving it up to you to prepare the canvas explicitly.
     **/
    prepare: function() {
      reloadMatrices(this);
      this.glViewport(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Jax.Context#update(timechange) -> Jax.Context
     * - timechange (Number): the amount of time, in seconds, since the previous update
     *
     * Automatically called over time, this function will trigger an update
     * of all controllers and objects attached to this context.
     *
     * You can programmatically trigger updates to these objects by calling
     * this method directly. Doing this is useful for constructing consistent
     * test cases.
     **/
    update: function(timechange) {
      if (this.current_controller && this.current_controller.update)
        this.current_controller.update(timechange);
      this.world.update(timechange);
      return this;
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
      stopRendering(this);
      stopUpdating(this);
      this.disposeEventListeners();
    },

    /**
     * Jax.Context#isDisposed() -> Boolean
     * Returns true if this context has been disposed.
     **/
    isDisposed: function() {
      return !!this.disposed;
    },

    /**
     * Jax.Context#pushMatrix(yield_to) -> Jax.Context
     * - yield_to (Function): a function to be called
     *
     * Pushes a new level onto the matrix stack and then calls the given function.
     * After the function completes, the matrix stack is reverted back to its
     * original state, effectively undoing any modifications made to the matrices
     * in the meantime.
     *
     * Example:
     *
     *     context.pushMatrix(function() {
     *       context.loadModelMatrix(Jax.IDENTITY_MATRIX);
     *       context.multViewMatrix(this.camera.getTransformationMatrix());
     *       // do some rendering
     *     });
     *     // matrix is restored to its previous state
     **/
    pushMatrix: function(yield_to) {
      this.matrix_stack.push();
      yield_to();
      this.matrix_stack.pop();
      return this;
    },
    
    /**
     * Jax.Context#getViewMatrix() -> mat4
     * Returns the view matrix. See Jax.MatrixStack#getViewMatrix for details.
     **/
    getViewMatrix: function() { return this.matrix_stack.getViewMatrix(); },
    
    /**
     * Jax.Context#getInverseViewMatrix() -> mat4
     * Returns the inverse view matrix. See Jax.MatrixStack#getInverseViewMatrix for details.
     **/
    getInverseViewMatrix: function() { return this.matrix_stack.getInverseViewMatrix(); },
    
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
  
    checkForRenderErrors: function() {
      /* Error checking is slow, so don't do it in production mode */
      if (Jax.environment == "production") return;

      var error = this.glGetError();
      if (error != GL_NO_ERROR)
      {
        var str = "GL error in "+this.canvas.id+": "+error+" ("+Jax.Util.enumName(error)+")";
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
  
  /* set up matrix stack delegation */
  klass.delegate(/^(get|load|mult)(.*)Matrix$/).into("matrix_stack");
  
  /** alias of: Jax.Context#getFramesPerSecond
   * Jax.Context#getFramerate() -> Number
   * The average numebr of frames rendered in one second.
   **/
  klass.prototype.getFramerate = klass.prototype.getFramesPerSecond;
  
  return klass;
})();

Jax.Context.identifier = 0;
Jax.Context.addMethods(GL_METHODS);
Jax.Context.addMethods(Jax.EVENT_METHODS);
