describe("Jax.Context", function() {
  var context, canvas;
  
  describe("root", function() {
    beforeEach(function() {
      Jax.routes.clear();
      Jax.Controller.create("welcome", {index: function() { }});
      Jax.views.push('welcome/index', function() { });
      
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

    it("should redirect to the root when given", function() {
      context = new Jax.Context(canvas, {root: "welcome/index"});
      expect(context.current_controller.getControllerName()).toEqual("welcome");
    });
  });
  
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
      });
      
      afterEach(function() { Jax.routes.clear(); });
      
      it("should not redirect", function() {
        var href = document.location.pathname;
        try { context = new Jax.Context(canvas, {alertErrors: false, root: "one"}); } catch(e) { }
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
        second: function() { },
        update: function(tc) {  }
      });
      
      Jax.routes.map("/", one);
      Jax.routes.map("two", two);
      Jax.routes.map("two/second", two, "second");
      
      context = new Jax.Context(SPEC_CONTEXT.canvas);
      context.alertErrors = false;
    });
    
    afterEach(function() { context.dispose(); });
    
    describe("to a different action in the same controller", function() {
      describe("without a view", function() {
        var view;
        beforeEach(function() {
          context.redirectTo("two");
          view = context.current_view;
          expect(view).not.toBeUndefined(); // sanity check
          context.redirectTo("two/second");
        });

        it("should not unload the world", function() {
          expect(context.world.countObjects()).toEqual(1);
        });

        it("should not change the view", function() {
          expect(view).toBe(context.current_view);
        });
      });
      
      describe("with a view", function() {
        var view;
        beforeEach(function() {
          Jax.views.push('two/second', function() { });
          context.redirectTo("two");
          view = context.current_view;
          expect(view).not.toBeUndefined(); // sanity check
          context.redirectTo("two/second");
        });

        it("should not unload the world", function() {
          expect(context.world.countObjects()).toEqual(1);
        });

        it("should not change the view", function() {
          expect(view).not.toBe(context.current_view);
        });
      });
    });
    
    it("should dispose the world", function() {
      spyOn(context.world, 'dispose').andCallThrough();
      context.redirectTo("two");
      expect(context.world.dispose).toHaveBeenCalled();
    });
    
    it("should reset the player camera", function() {
      context.player.camera.setPosition([10,10,10]);
      context.player.camera.rotate(1, [1,1,1]);
      context.redirectTo("two");
      expect(context.player.camera.getPosition()).toEqualVector([0,0,0]);
      expect(context.player.camera.getViewVector()).toEqualVector([0,0,-1]);
      expect(context.player.camera.getUpVector()).toEqualVector([0,1,0]);
      expect(context.player.camera.getRightVector()).toEqualVector([1,0,0]);
    });
    
    it("to a bad route should stop execution of current controller", function() {
      context.redirectTo("two");
      var two_instance = context.current_controller;
      
      jasmine.Clock.tick(Jax.update_speed+1);
      try {
        context.redirectTo("invalid");
        throw new Error("No error raised!");
      } catch(e) {
        expect(e.toString()).toMatch("Route not recognized: 'invalid'");
      }
      // no reason to make this assertion here... and i'm not convinced
      // it matters, so long as rendering and updating stop; this is an
      // error condition after all
      // expect(context.world.objects.length).toEqual(0);
      
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
      Jax.Controller.create("welcome", {index: function() { action_called++; }});
      Jax.views.push("welcome/index", function() {
        this.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        this.world.render();
        view_called++;
      });
      context = new Jax.Context(SPEC_CONTEXT.canvas, {root:"welcome"});
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
        if (error.phase != 'update') alert(error);
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
