describe("Jax.Context", function() {
  var context, canvas;
  
  describe("errors", function() {
    beforeEach(function() {
      Jax.routes.clear();

      context = null;
      canvas = document.createElement('canvas');
      canvas.setAttribute("id", "c");
      canvas.setAttribute("width", "100");
      canvas.setAttribute("height", "100");
      canvas.style.display = "none";
      document.body.appendChild(canvas);
    });
    
    afterEach(function() {
      if (context) context.dispose();
      document.body.removeChild(canvas);
    });
    
    describe("encountering a non-compatability error during init", function() {
      beforeEach(function() {
        Jax.routes.clear();

        Jax.views.push('one/index', function() { });
        var one = Jax.Controller.create("one", {index:function() {throw new Error("my bad")}});
        Jax.routes.root(one, "index");
      });
      
      afterEach(function() { Jax.routes.clear(); });
      
      it("should not redirect", function() {
        var href = document.location.pathname;
        try { context = new Jax.Context(canvas, {alertErrors: false}); } catch(e) { }
        expect(document.location.pathname).toEqual(href);
      });
    });
    
    describe("with an error function in ApplicationController", function() {
      var _app, _error;

      beforeEach(function() {
        _error = undefined;
        _app = Jax.getGlobal().ApplicationController;
        Jax.getGlobal().ApplicationController = Jax.Controller.create("application", Jax.Controller, {
          error: function(error) {
            _error = error;
            return true;
          }
        });
      });
      
      afterEach(function() {
        if (!_app) delete Jax.getGlobal().ApplicationController;
        else Jax.getGlobal().ApplicationController = _app;
      });
      
      it("should let ApplicationController process the error", function() {
        canvas.getContext = function() { return null; };
        context = new Jax.Context(canvas);
        // expect(_error).not.toBeUndefined();
      });
    });
  });
  
  describe("with no routes", function() {
    beforeEach(function() { 
      Jax.routes.clear();
      canvas = document.createElement('canvas');
      canvas.setAttribute("id", "c");
      canvas.setAttribute("width", "100");
      canvas.setAttribute("height", "100");
      canvas.style.display = "none";
      document.body.appendChild(canvas);
      context = new Jax.Context(canvas);
    });
    afterEach(function() { context.dispose(); document.body.removeChild(canvas); });
  
    it("should keep a handle to canvas", function() {
      expect(context.canvas.id).toEqual("c");
    });
  
    it("should not be rendering, because there's no root controller", function() {
      expect(context.isRendering()).toBeFalsy();
    });
    
    describe("after disposal", function() {
      beforeEach(function() { context.dispose(); });
      
      it("should unregister all event handlers", function() {
        expect(context.canvas.getEventListeners('click')).toBeEmpty();
        expect(context.canvas.getEventListeners('mousedown')).toBeEmpty();
        expect(context.canvas.getEventListeners('mousemove')).toBeEmpty();
        expect(context.canvas.getEventListeners('mouseout')).toBeEmpty();
        expect(context.canvas.getEventListeners('mouseover')).toBeEmpty();
        expect(context.canvas.getEventListeners('mouseup')).toBeEmpty();
        expect(context.canvas.getEventListeners('keydown')).toBeEmpty();
        expect(context.canvas.getEventListeners('keypress')).toBeEmpty();
        expect(context.canvas.getEventListeners('keyup')).toBeEmpty();
        expect(context.canvas.getEventListeners('onclick')).toBeEmpty();
        expect(context.canvas.getEventListeners('onmousedown')).toBeEmpty();
        expect(context.canvas.getEventListeners('onmousemove')).toBeEmpty();
        expect(context.canvas.getEventListeners('onmouseout')).toBeEmpty();
        expect(context.canvas.getEventListeners('onmouseover')).toBeEmpty();
        expect(context.canvas.getEventListeners('onmouseup')).toBeEmpty();
        expect(context.canvas.getEventListeners('onkeydown')).toBeEmpty();
        expect(context.canvas.getEventListeners('onkeypress')).toBeEmpty();
        expect(context.canvas.getEventListeners('onkeyup')).toBeEmpty();
      });
    });
  });
  
  describe("when redirecting", function() {
    beforeEach(function() {
      jasmine.Clock.useMock();
      
      Jax.routes.clear();
      
      Jax.views.push('one/index', function() { });
      Jax.views.push('two/index', function() { });

      var one = Jax.Controller.create("one", {index:function() {}});
      var two = Jax.Controller.create("two", {
        index:function() { this.world.addObject(new Jax.Model()); },
        update: function(tc) {  }
      });
      
      Jax.routes.map("/", one);
      Jax.routes.map("two", two);
      
      context = new Jax.Context(SPEC_CONTEXT.canvas);
      context.alertErrors = false;
    });
    
    afterEach(function() { context.dispose(); });
    
    it("should dispose the world", function() {
      spyOn(context.world, 'dispose').andCallThrough();
      context.redirectTo("two");
      expect(context.world.dispose).toHaveBeenCalled();
    });
    
    it("to a bad route should stop execution of current controller", function() {
      context.redirectTo("two");
      var two_instance = context.current_controller;
      
      jasmine.Clock.tick(Jax.update_speed+1);
      try {
        context.redirectTo("invalid");
        throw new Error("No error raised!");
      } catch(e) {
        expect(e.message || e.toString()).toEqual("Error: Route not recognized: 'invalid'");
      }
      expect(context.world.objects.length).toEqual(0);
      
      spyOn(two_instance, "update"); // notice we can't do this earlier because it *does* get called above
      jasmine.Clock.tick(Jax.update_speed+1);
      expect(two_instance.update).not.toHaveBeenCalled();
    });
  });
  
  describe("with routes", function() {
    var controller;
    var action_called = 0, view_called = 0;
    
    beforeEach(function() {
      Jax.routes.clear();
      Jax.routes.root(Jax.Controller.create("welcome", {index: function() { action_called++; }}), "index");
      Jax.views.push("welcome/index", function() {
        this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        this.world.render();
        view_called++;
      });
      context = new Jax.Context(SPEC_CONTEXT.canvas);
    });
    afterEach(function() { context.dispose(); });
  
    it("should be rendering, because there's a controller", function() {
      expect(context.isRendering()).toBeTruthy();
    });
    
    it("should fire onError events during render", function() {
      var fired = false;
      context.addEventListener('error', function(error) {
        // silence error. this prevents console.log() and alert() from firing.
        error.silence = true;
        fired = true;
        expect(error.phase).toEqual('render');
      });
      
      var obj = new Jax.Model();
      obj.render = function() { throw new Error("err"); };
      context.world.addObject(obj);
      
      waitsFor(function() { return fired; });
    });

    it("should fire onError events during object update", function() {
      var fired = false;
      context.addEventListener('error', function(error) {
        // silence error. this prevents console.log() and alert() from firing.
        error.silence = true;
        fired = true;
        expect(error.phase).toEqual('update');
      });
      
      var obj = new Jax.Model();
      obj.update = function() { throw new Error("err"); };
      context.world.addObject(obj);
      
      waitsFor(function() { return fired; });
    });

    it("should fire onError events during controller update", function() {
      var fired = false;
      context.addEventListener('error', function(error) {
        // silence error. this prevents console.log() and alert() from firing.
        error.silence = true;
        fired = true;
        expect(error.phase).toEqual('update');
      });
      
      context.current_controller.update = function() { throw new Error("err"); };
      waitsFor(function() { return fired; });
    });
  });
});
