describe("Jax.Controller", function() {
  var klass;
  var instance;
  
  it("should map a default view", function() {
    Jax.views.remove("welcome/index");
    Jax.Controller.create("welcome", {});
    expect(Jax.views.find("welcome/index")).not.toBeUndefined();
  });
  
  describe("with a view defined", function() {
    var view;
    beforeEach(function() {
      view = function() { };
      Jax.views.push("FooBars/index", view);
    });
    
    it("should indicate the view exists", function() {
      expect(Jax.views.exists("foo_bars/index")).toBeTruthy();
    });
    
    it("should indicate CamelCased variants of the view exist", function() {
      expect(Jax.views.exists("Foo_bars/index")).toBeTruthy();
      expect(Jax.views.exists("FooBars/index")).toBeTruthy();
    });
    
    it("should override the default view", function() {
      Jax.Controller.create("FooBars", {});
      expect(Jax.views.find("foo_bars/index").view_func).toBe(view);
    });
  });
  
  describe("with an update method", function() {
    var context;
    
    beforeEach(function() {
      jasmine.Clock.useMock();
      SPEC_CONTEXT.useRequestAnimFrame = false;
      klass = Jax.Controller.create("welcome", { index: function() { }, update: function(tc) { } });
      Jax.views.push("welcome/index", function() { });
      Jax.routes.map("welcome", klass);
      instance = SPEC_CONTEXT.redirectTo("welcome");
    });
    
    afterEach(function() { SPEC_CONTEXT.dispose(); SPEC_CONTEXT.useRequestAnimFrame = true; });
    
    it("should be called with the elapsed time in seconds", function() {
      spyOn(instance, 'update');
      SPEC_CONTEXT.startRendering();
      SPEC_CONTEXT.startUpdating();
      jasmine.Clock.tick(75);
      expect(instance.update).toHaveBeenCalledWith(0.016);
      SPEC_CONTEXT.stopUpdating();
    });
  });

  describe("which does not render or redirect", function() {
    beforeEach(function() {
      klass = Jax.Controller.create("welcome", { index: function() { } });
      instance = new klass();
    });
    
    it("should produce the view named after the controller and action names", function() {
      instance.fireAction("index");
      expect(instance.view_key).toEqual("welcome/index");
    });
    
    it("should map the route automatically", function() {
      expect(function() { Jax.routes.recognizeRoute("welcome/index") }).not.toThrow();
    });
  });

  describe("with event actions", function() {
    beforeEach(function() {
      klass = Jax.Controller.create("welcome", { index: function() { } });
      instance = new klass();
    });

    var evt;

    function doMouseEvent(type) {
      /* MouseEvents - click, mousedown, mousemove, mouseout, mouseover, mouseup */
      /* initMouseEvent - type, bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey,
       * altKey, shiftKey, metaKey, button, relatedTarget */
      evt = document.createEvent('MouseEvents');
      evt.initMouseEvent(type, true, true, Jax.getGlobal(), 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      SPEC_CONTEXT.canvas.dispatchEvent(evt);
    }

    function doKeyEvent(type) {
      /* UIEvents - DOMActivate, DOMFocusIn, DOMFocusOut */
      /* KeyEvents / UIEvents - keydown, keypress, keyup */
      /* initUIEvent - type, bubbles, cancelable windowObject, detail */
      if (Jax.getGlobal().KeyEvent && !KeyEvent.fake) {
        evt = document.createEvent('KeyEvents');
        // type, bubbles, cancelable, windowObject, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode
        evt.initKeyEvent(type, true, true, Jax.getGlobal(), false, false, false, false, 13, 0);
      } else {
        evt = document.createEvent('UIEvents');
        evt.initUIEvent(type, true, true, Jax.getGlobal(), 1);
        evt.keyCode = 13;
      }
      SPEC_CONTEXT.canvas.dispatchEvent(evt);
    }

    beforeEach(function() {
      var methods = {
        mouse_clicked:  function(evt) { },
        mouse_moved:    function(evt) { },
        mouse_dragged:  function(evt) { },
        mouse_pressed:  function(evt) { },
        mouse_exited:   function(evt) { },
        mouse_entered:  function(evt) { },
        mouse_released: function(evt) { },
        key_typed:      function(evt) { },
        key_pressed:    function(evt) { },
        key_released:   function(evt) { }
      };
      klass.addMethods(methods);
      expect(instance).toHaveMethod("mouse_clicked"); // verify methods were added
      for (var method_name in methods) spyOn(instance, method_name);
      Jax.routes.clear();
      SPEC_CONTEXT.current_controller = instance;
      SPEC_CONTEXT.registerMouseListeners(instance);
      SPEC_CONTEXT.registerKeyListeners(instance);
    });

    it("should dispatch key pressed events", function() {
      doKeyEvent('keypress');
      expect(instance.key_typed).toHaveBeenCalled();
    });

    it("should dispatch key released events", function() {
      doKeyEvent('keyup');
      expect(instance.key_released).toHaveBeenCalled();
    });

    it("should dispatch key down events", function() {
      doKeyEvent('keydown');
      expect(instance.key_pressed).toHaveBeenCalled();
    });

    it("should dispatch mouse released events", function() {
      doMouseEvent('mouseup');
      expect(instance.mouse_released).toHaveBeenCalled();
    });
    it("should dispatch mouse entered events", function() {
      doMouseEvent('mouseout');
      expect(instance.mouse_exited).toHaveBeenCalled();
    });
    it("should dispatch mouse exited events", function() {
      doMouseEvent('mouseover');
      expect(instance.mouse_entered).toHaveBeenCalled();
    });

    it("should dispatch mouse pressed events", function() {
      doMouseEvent('mousedown');
      expect(instance.mouse_pressed).toHaveBeenCalled();
    });

    it("should dispatch mouse dragged events", function() {
      doMouseEvent('mousedown');
      doMouseEvent('mousemove');
      doMouseEvent('mouseup');
      expect(instance.mouse_dragged).toHaveBeenCalled();
    });

    it("should dispatch mouse moved events", function() {
      doMouseEvent('mousemove');
      expect(instance.mouse_moved).toHaveBeenCalled();
    });

    it("should dispatch mouse clicked events", function() {
      doMouseEvent('click');
      expect(instance.mouse_clicked).toHaveBeenCalled();
    });
  });
});
